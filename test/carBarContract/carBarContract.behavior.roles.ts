import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { expect } from "chai";
import { DECIMAL_FACTOR, getNow, toNumber, vmEsceptionText } from "common";
import { ethers, upgrades } from "hardhat";
import { seedData } from "seeds/seedData";
import { Roles, Sold, errorMessage } from "test/testData";
import { ContextBase } from "test/types";
import { getCollectionName, initCollectionsRealWithBuying } from "test/utils";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";

async function upgradeContract(carBarContractAddress: string, owner: SignerWithAddress) {
  const carBarContractFactory = <CarBarContract__factory>(
    await ethers.getContractFactory("CarBarContractNew", owner)
  );

  const oldImplAddress = await getImplementationAddress(ethers.provider, carBarContractAddress);

  const upgradedContract = <CarBarContract>(
    await upgrades.upgradeProxy(carBarContractAddress, carBarContractFactory)
  );

  const newImplAddress = await getImplementationAddress(ethers.provider, upgradedContract.address);

  expect(newImplAddress).not.eq(oldImplAddress);
}

async function withdraw(
  carBarContract: CarBarContract,
  testUSDT: TestUSDT,
  user1: SignerWithAddress,
) {
  await carBarContract.withdraw(user1.address, seedData.price0);

  expect(await testUSDT.balanceOf(carBarContract.address)).equal(seedData.zero);
  expect(await testUSDT.balanceOf(user1.address)).equal(seedData.userInitialBalance0);
}

async function updateToken(carBarContract: CarBarContract) {
  const oldToken = await carBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);

  await carBarContract.updateToken(
    seedData.collectionId0,
    seedData.tokenId0,
    seedData.todayMinus1m,
  );

  const updatedToken = await carBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);
  expect(updatedToken.owner).equal(oldToken.owner);
  expect(updatedToken.sold).equal(oldToken.sold);
  expect(updatedToken.expiryDate).equal(seedData.todayMinus1m);
}

async function updateCollection(carBarContract: CarBarContract) {
  const oldCollection = await carBarContract.fetchCollection(seedData.collectionId0);

  await carBarContract.updateCollection(seedData.collectionId0, getCollectionName(10));

  const updatedCollection = await carBarContract.fetchCollection(seedData.collectionId0);

  expect(updatedCollection.collectionId).eq(oldCollection.collectionId);
  expect(updatedCollection.collectionName).eq(getCollectionName(10));
  expect(updatedCollection.tokenCount).eq(oldCollection.tokenCount);
  expect(updatedCollection.price).eq(oldCollection.price);
  expect(updatedCollection.expiryDate).eq(oldCollection.expiryDate);
}

async function userBuyToken(that: ContextBase) {
  await that.user1CarBarContract.buyToken(seedData.collectionId0);
  expect(
    await that.user1CarBarContract.balanceOf(that.user1.address, seedData.collectionId0),
  ).equal(2);
}

async function userSafeTransferFrom(that: ContextBase) {
  await that.user1CarBarContract.safeTransferFrom(
    that.user1.address,
    that.user2.address,
    0,
    1,
    seedData.emptyData,
  );

  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  expect(tokens[0].owner).equal(that.user2.address);
  expect(tokens[0].sold).equal(Sold.Transfer);
  expect(tokens[1].owner).equal(that.superOwner.address);
  expect(tokens[1].sold).equal(Sold.None);
}

async function getTotalBalance(carBarContract: CarBarContract, account: string) {
  let result = 0;

  const collections = await carBarContract.fetchCollections();

  for (const collection of collections) {
    result += toNumber(
      await carBarContract.balanceOf(account, collection.collectionId),
      DECIMAL_FACTOR,
    );
  }

  return result;
}

async function getTotalTokens(carBarContract: CarBarContract, account: string) {
  let result = 0;

  const collections = await carBarContract.fetchCollections();

  for (const collection of collections) {
    const tokens = await carBarContract.fetchTokens(collection.collectionId);
    result += tokens.filter((token) => token.owner === account).length;
  }

  return result;
}

export function shouldBehaveCorrectRoles(): void {
  describe("roles", () => {
    beforeEach(async function () {
      await initCollectionsRealWithBuying(this);
    });

    it("check initial roles", async function () {
      expect(await this.ownerCarBarContract.superOwner()).eq(this.superOwner.address);
      expect(await this.ownerCarBarContract.owner()).eq(this.owner.address);

      //superOwner
      expect(
        await this.ownerCarBarContract.hasRole(Roles.SUPER_OWNER_ROLE, this.superOwner.address),
      ).eq(true);
      expect(await this.ownerCarBarContract.hasRole(Roles.OWNER_ROLE, this.superOwner.address)).eq(
        false,
      );

      //owner
      expect(await this.ownerCarBarContract.hasRole(Roles.SUPER_OWNER_ROLE, this.owner.address)).eq(
        false,
      );
      expect(await this.ownerCarBarContract.hasRole(Roles.OWNER_ROLE, this.owner.address)).eq(true);
      expect(await this.ownerCarBarContract.hasOwnerSuperOwnerPermission()).eq(true);

      //user1
      expect(await this.ownerCarBarContract.hasRole(Roles.SUPER_OWNER_ROLE, this.user1.address)).eq(
        false,
      );
      expect(await this.ownerCarBarContract.hasRole(Roles.OWNER_ROLE, this.user1.address)).eq(
        false,
      );

      expect(await this.ownerTestUSDT.balanceOf(this.ownerCarBarContract.address)).equal(
        seedData.price0,
      );

      expect(await getTotalBalance(this.ownerCarBarContract, this.superOwner.address)).eq(8);
      expect(await getTotalTokens(this.ownerCarBarContract, this.superOwner.address)).eq(8);
      expect(await getTotalBalance(this.ownerCarBarContract, this.owner.address)).eq(0);
      expect(await getTotalTokens(this.ownerCarBarContract, this.owner.address)).eq(0);
      expect(await getTotalBalance(this.ownerCarBarContract, this.user1.address)).eq(1);
      expect(await getTotalTokens(this.ownerCarBarContract, this.user1.address)).eq(1);
    });

    it("superOwner is allowed to upgrade contract", async function () {
      await upgradeContract(this.ownerCarBarContract.address, this.superOwner);
    });

    it("owner is allowed to upgrade contract", async function () {
      await upgradeContract(this.ownerCarBarContract.address, this.owner);
    });

    it("user isn't allowed to upgrade contract", async function () {
      const carBarContractFactory = <CarBarContract__factory>(
        await ethers.getContractFactory("CarBarContractNew", this.user1)
      );

      await expect(
        upgrades.upgradeProxy(this.ownerCarBarContract.address, carBarContractFactory),
      ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner));
    });

    describe("After the superOwner permission is returned from owner", () => {
      beforeEach(async function () {
        this.ownerCarBarContract.giveSuperOwnerPermissionToOwner(0);
      });

      it("initial check", async function () {
        expect(
          await this.ownerCarBarContract.hasRole(Roles.SUPER_OWNER_ROLE, this.superOwner.address),
        ).eq(true);
        expect(
          await this.ownerCarBarContract.hasRole(Roles.SUPER_OWNER_ROLE, this.owner.address),
        ).eq(false);
        expect(await this.ownerCarBarContract.hasOwnerSuperOwnerPermission()).eq(false);
        expect(await this.ownerTestUSDT.balanceOf(this.user1.address)).equal(
          seedData.userInitialBalance0.sub(seedData.price0),
        );

        expect(await getTotalBalance(this.ownerCarBarContract, this.superOwner.address)).eq(8);
        expect(await getTotalTokens(this.ownerCarBarContract, this.superOwner.address)).eq(8);
        expect(await getTotalBalance(this.ownerCarBarContract, this.owner.address)).eq(0);
        expect(await getTotalTokens(this.ownerCarBarContract, this.owner.address)).eq(0);
        expect(await getTotalBalance(this.ownerCarBarContract, this.user1.address)).eq(1);
        expect(await getTotalTokens(this.ownerCarBarContract, this.user1.address)).eq(1);
      });

      it("superOwner is allowed to upgrade contract", async function () {
        await upgradeContract(this.ownerCarBarContract.address, this.superOwner);
      });

      it("owner isn't allowed to upgrade contract", async function () {
        await expect(upgradeContract(this.ownerCarBarContract.address, this.owner)).rejectedWith(
          vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner),
        );
      });

      it("superOwner is allowed to withdraw USDT", async function () {
        await withdraw(this.superOwnerCarBarContract, this.ownerTestUSDT, this.user1);
      });

      it("owner isn't allowed to withdraw USDT", async function () {
        await expect(
          withdraw(this.ownerCarBarContract, this.ownerTestUSDT, this.user1),
        ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner));
      });

      it("owner is allowed update certain collection", async function () {
        await updateCollection(await this.ownerCarBarContract);
      });

      it("owner is allowed update certain token", async function () {
        await updateToken(this.ownerCarBarContract);
      });

      it("user1 can call buyToken to send tokens to user2", async function () {
        await userBuyToken(this);
      });

      it("user1 can call safeTransferFrom to send tokens to user2", async function () {
        await userSafeTransferFrom(this);
      });

      describe("superOwner gave upgrade permission to owner", () => {
        beforeEach(async function () {
          await this.superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(1);
        });

        it("initial check", async function () {
          expect(await this.superOwnerCarBarContract.superOwnerPermissionTimeLimit()).closeTo(
            getNow() + 3600,
            seedData.timeDelta,
          );
        });

        it("superOwner is allowed to upgrade contract", async function () {
          await upgradeContract(this.ownerCarBarContract.address, this.superOwner);
        });

        it("owner is allowed to upgrade contract", async function () {
          await upgradeContract(this.ownerCarBarContract.address, this.owner);
        });

        it("owner is allowed to upgrade contract", async function () {
          await upgradeContract(this.ownerCarBarContract.address, this.owner);
        });

        describe("after some time", () => {
          beforeEach(async function () {
            await time.increaseTo(seedData.todayPlus1h + seedData.timeDelta);
          });

          it("superOwner is allowed to upgrade contract", async function () {
            await upgradeContract(this.ownerCarBarContract.address, this.superOwner);
          });

          it("owner isn't allowed to upgrade contract", async function () {
            await expect(
              upgradeContract(this.ownerCarBarContract.address, this.owner),
            ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner));
          });
        });
      });

      describe("change owner", () => {
        beforeEach(async function () {
          await this.superOwnerCarBarContract.setOwner(this.owner2.address);
        });

        it("initial check", async function () {
          expect(await this.ownerCarBarContract.hasRole(Roles.OWNER_ROLE, this.owner.address)).eq(
            false,
          );
          expect(await this.ownerCarBarContract.hasRole(Roles.OWNER_ROLE, this.owner2.address)).eq(
            true,
          );
        });

        it("superOwner is allowed to upgrade contract", async function () {
          await upgradeContract(this.ownerCarBarContract.address, this.superOwner);
        });

        it("owner isn't allowed to upgrade contract", async function () {
          await expect(upgradeContract(this.ownerCarBarContract.address, this.owner)).rejectedWith(
            vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner),
          );
        });

        it("owner2 isn't allowed to upgrade contract", async function () {
          await expect(upgradeContract(this.ownerCarBarContract.address, this.owner2)).rejectedWith(
            vmEsceptionText(errorMessage.onlySuperOwnerOrPermittedOwner),
          );
        });

        it("owner isn't allowed update certain collection", async function () {
          await expect(updateCollection(await this.ownerCarBarContract)).rejectedWith(
            vmEsceptionText(errorMessage.onlySuperOwnerOrOwner),
          );
        });

        it("owner isn't allowed update certain token", async function () {
          await expect(updateToken(await this.ownerCarBarContract)).rejectedWith(
            vmEsceptionText(errorMessage.onlySuperOwnerOrOwner),
          );
        });

        it("owner2 is allowed update certain collection", async function () {
          await updateCollection(this.owner2CarBarContract);
        });

        it("owner2 is allowed update certain token", async function () {
          await updateToken(this.owner2CarBarContract);
        });

        it("user1 can call buyToken to send tokens to user2", async function () {
          await userBuyToken(this);
        });

        it("user1 can call safeTransferFrom to send tokens to user2", async function () {
          await userSafeTransferFrom(this);
        });
      });
    });
  });
}
