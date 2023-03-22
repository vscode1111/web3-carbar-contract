import { expect } from "chai";
import { attempt, errorHandler, getNow, waitTx } from "common";
import { getUSDTDecimalsFactor } from "deploy/utils";
import { seedData } from "seeds/seedData";
import { ContextBase } from "test/types";
import { CarBarContract, TokenSoldEvent } from "typechain-types/contracts/CarBarContract";

import { errorMessage } from "../testData";
import { getCollectionName, initCollectionsReal } from "../utils";

function findTokenCount(tokens: CarBarContract.TokenItemStructOutput[], address: string) {
  return tokens.filter((token) => token.owner === address).length;
}

export async function smokeTest(that: ContextBase) {
  await setOwner(that);
  await user1BuysToken(that);
  await user1TransfersToken(that);
  await user2TransfersBackToken(that);
  await onwerTransfersToken(that);
  await shopTransfersTokens(that);
  await ownerUpdatesCollection(that);
  await ownerUpdatesToken(that);
  await superOwnerWithdraws(that);
  await ownerTriesToWithdraw(that);
  await user1TriesToWithdraw(that);
  await user1BuysToken(that);
  await ownerWithdrawsWithPermission(that);
  await setOwner2(that);
  await owner2UpdatesToken(that);
  await ownerTriesToUpdateToken(that);
  await setOwner(that);
}

const labels = {
  smokeTest: "Smoke test",
  user1BuysToken: "--User1 buys token",
  user1TransfersToken: "--User1 transfers token to user2",
  user2TransfersBackToken: "--User2 transfers back token to superOwner",
  onwerTransfersToken: "--Onwer transfers superOwner's token to user1",
  shopTransfersToken: "--Shop transfers superOwner's token to user1",
  ownerUpdatesCollection: "--Owner updates collection",
  ownerUpdatesToken: "--Owner updates token",
  owner2UpdatesToken: "--Owner2 updates token",
  ownerTriesToUpdateToken: "--Owner tries to update token",
  superOwnerWithdraws: "--SuperOwner withdraws",
  ownerTriesToWithdraw: "--Owner tries to withdraw",
  user1TriesToWithdraw: "--User1 tries to withdraw",
  ownerWithdrawsWithPermission: "--Owner withdraws with permission",
  setOwner: "--Set owner",
  setOwner2: "--Set owner2",
};

export async function user1BuysToken(that: ContextBase) {
  console.log(labels.user1BuysToken);

  await waitTx(
    that.user1TestUSDT.approve(that.ownerCarBarContract.address, seedData.price0),
    "approve",
    seedData.attemps,
    seedData.delayMs,
  );

  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  let user1TokenCount0 = findTokenCount(tokens, that.user1.address);

  const receipt = await waitTx(
    that.user1CarBarContract.buyToken(seedData.collectionId0),
    "buyToken",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      let user1TokenCount1 = findTokenCount(tokens, that.user1.address);
      expect(user1TokenCount1).eq(user1TokenCount0 + 1);

      const tokenSoldEvent = receipt.events?.find(
        (item) => item.event === "TokenSold",
      ) as TokenSoldEvent;

      expect(tokenSoldEvent).not.undefined;

      const { collectionId, tokenId, seller, owner, price, timestamp } = tokenSoldEvent?.args;

      expect(collectionId).equal(seedData.collectionId0);
      expect(tokenId).greaterThanOrEqual(0);
      expect(seller).equal(that.superOwner.address);
      expect(owner).equal(that.user1.address);
      expect(price).equal(seedData.price0);
      expect(timestamp).closeTo(getNow(), seedData.timeDelta);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function user1TransfersToken(that: ContextBase) {
  console.log(labels.user1TransfersToken);
  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  const user1TokenCount0 = findTokenCount(tokens, that.user1.address);

  await waitTx(
    that.user1CarBarContract.safeTransferFrom(
      that.user1.address,
      that.user2.address,
      seedData.collectionId0,
      1,
      seedData.emptyData,
    ),
    "safeTransferFrom",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      const user1TokenCount1 = findTokenCount(tokens, that.user1.address);
      expect(user1TokenCount1).eq(user1TokenCount0 - 1);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function user2TransfersBackToken(that: ContextBase) {
  console.log(labels.user2TransfersBackToken);
  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  const user2TokenCount0 = findTokenCount(tokens, that.user2.address);

  await waitTx(
    that.user2CarBarContract.safeTransferFrom(
      that.user2.address,
      that.superOwner.address,
      seedData.collectionId0,
      1,
      seedData.emptyData,
    ),
    "safeTransferFrom",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      const user2TokenCount1 = findTokenCount(tokens, that.user2.address);
      expect(user2TokenCount1).eq(user2TokenCount0 - 1);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function onwerTransfersToken(that: ContextBase) {
  console.log(labels.onwerTransfersToken);
  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  const user1TokenCount0 = findTokenCount(tokens, that.user1.address);

  await waitTx(
    that.ownerCarBarContract.safeTransferFrom(
      that.superOwner.address,
      that.user1.address,
      seedData.collectionId0,
      1,
      seedData.emptyData,
    ),
    "safeTransferFrom",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      const user1TokenCount1 = findTokenCount(tokens, that.user1.address);
      expect(user1TokenCount1).eq(user1TokenCount0 + 1);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function shopTransfersTokens(that: ContextBase) {
  console.log(labels.shopTransfersToken);
  let tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
  const user1TokenCount0 = findTokenCount(tokens, that.user1.address);

  await waitTx(
    that.superOwnerCarBarContract.setApprovalForAll(that.shop.address, true),
    "setApprovalForAll",
    seedData.attemps,
    seedData.delayMs,
  );

  await waitTx(
    that.shopCarBarContract.safeTransferFrom(
      that.superOwner.address,
      that.user1.address,
      seedData.collectionId0,
      1,
      seedData.emptyData,
    ),
    "safeTransferFrom",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      tokens = await that.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      const user1TokenCount1 = findTokenCount(tokens, that.user1.address);
      expect(user1TokenCount1).eq(user1TokenCount0 + 1);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerUpdatesCollection(that: ContextBase) {
  console.log(labels.ownerUpdatesCollection);
  const oldCollection = await that.ownerCarBarContract.fetchCollection(seedData.collectionId0);

  const testName = getCollectionName(10);

  await waitTx(
    that.ownerCarBarContract.updateCollection(seedData.collectionId0, testName),
    "updateCollection",
  );

  await attempt(
    async () => {
      const updatedCollection = await that.ownerCarBarContract.fetchCollection(
        seedData.collectionId0,
      );
      expect(updatedCollection.collectionId).eq(oldCollection.collectionId);
      expect(updatedCollection.collectionName).eq(testName);
      expect(updatedCollection.tokenCount).eq(oldCollection.tokenCount);
      expect(updatedCollection.price).eq(oldCollection.price);
      expect(updatedCollection.expiryDate).eq(oldCollection.expiryDate);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerUpdatesToken(that: ContextBase) {
  console.log(labels.ownerUpdatesToken);
  let token = await that.ownerCarBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);
  const owner_ = token.owner;
  const sold = token.sold;

  await waitTx(
    that.ownerCarBarContract.updateToken(seedData.collectionId0, seedData.tokenId0, seedData.today),
    "updateToken",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      token = await that.ownerCarBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);
      expect(token.tokenId).eq(seedData.tokenId0);
      expect(token.owner).eq(owner_);
      expect(token.expiryDate).eq(seedData.today);
      expect(token.sold).eq(sold);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function owner2UpdatesToken(that: ContextBase) {
  console.log(labels.owner2UpdatesToken);
  let token = await that.ownerCarBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);
  const owner_ = token.owner;
  const sold = token.sold;

  await waitTx(
    that.owner2CarBarContract.updateToken(
      seedData.collectionId0,
      seedData.tokenId0,
      seedData.today,
    ),
    "updateToken",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      token = await that.ownerCarBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);
      expect(token.tokenId).eq(seedData.tokenId0);
      expect(token.owner).eq(owner_);
      expect(token.expiryDate).eq(seedData.today);
      expect(token.sold).eq(sold);
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerTriesToUpdateToken(that: ContextBase) {
  console.log(labels.ownerTriesToUpdateToken);

  await attempt(
    async () => {
      await expect(
        that.ownerCarBarContract.updateToken(
          seedData.collectionId0,
          seedData.tokenId0,
          seedData.today,
        ),
      ).rejected.then((e) => errorHandler(e, errorMessage.onlySuperOwnerOrOwner));
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function superOwnerWithdraws(that: ContextBase) {
  console.log(labels.superOwnerWithdraws);

  const carBarAmount0 = await that.ownerTestUSDT.balanceOf(that.ownerCarBarContract.address);
  const user1Amount0 = await that.ownerTestUSDT.balanceOf(that.user1.address);

  const factor = await getUSDTDecimalsFactor(that.ownerTestUSDT);

  await waitTx(
    that.superOwnerCarBarContract.withdraw(that.user1.address, carBarAmount0),
    "withdraw",
    seedData.attemps,
    seedData.delayMs,
  );

  console.log(`${carBarAmount0.toNumber() / factor} USDT was withdrawed to ${that.user1.address}`);

  await attempt(
    async function () {
      const carBarAmount1 = await that.ownerTestUSDT.balanceOf(that.ownerCarBarContract.address);
      expect(carBarAmount1).eq(0);

      const user1Amount1 = await that.ownerTestUSDT.balanceOf(that.user1.address);
      expect(user1Amount1).eq(user1Amount0.add(carBarAmount0));
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerTriesToWithdraw(that: ContextBase) {
  console.log(labels.ownerTriesToWithdraw);

  await attempt(
    async () => {
      await expect(
        that.ownerCarBarContract.withdraw(that.owner.address, seedData.zero),
      ).rejected.then((e) => errorHandler(e, errorMessage.onlySuperOwnerOrPermittedOwner));
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function user1TriesToWithdraw(that: ContextBase) {
  console.log(labels.user1TriesToWithdraw);

  await attempt(
    async () => {
      await expect(
        that.ownerCarBarContract.withdraw(that.user1.address, seedData.zero),
      ).rejected.then((e) => errorHandler(e, errorMessage.onlySuperOwnerOrPermittedOwner));
    },
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function ownerWithdrawsWithPermission(that: ContextBase) {
  console.log(labels.ownerWithdrawsWithPermission);

  await waitTx(
    that.superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(1),
    "giveSuperOwnerPermissionToOwner",
    seedData.attemps,
    seedData.delayMs,
  );

  const carBarAmount0 = await that.ownerTestUSDT.balanceOf(that.ownerCarBarContract.address);
  const user1Amount0 = await that.ownerTestUSDT.balanceOf(that.user1.address);

  expect(carBarAmount0).greaterThan(0);

  const factor = await getUSDTDecimalsFactor(that.ownerTestUSDT);

  await waitTx(
    that.ownerCarBarContract.withdraw(that.user1.address, carBarAmount0),
    "withdraw",
    seedData.attemps,
    seedData.delayMs,
  );

  console.log(`${carBarAmount0.toNumber() / factor} USDT was withdrawed to ${that.user1.address}`);

  await attempt(
    async () => {
      const carBarAmount1 = await that.ownerTestUSDT.balanceOf(that.ownerCarBarContract.address);
      expect(carBarAmount1).eq(0);

      const user1Amount1 = await that.ownerTestUSDT.balanceOf(that.user1.address);
      expect(user1Amount1).eq(user1Amount0.add(carBarAmount0));
    },
    seedData.attemps,
    seedData.delayMs,
  );

  await waitTx(
    that.superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(0),
    "giveSuperOwnerPermissionToOwner",
    seedData.attemps,
    seedData.delayMs,
  );
}

export async function setOwner(that: ContextBase) {
  console.log(labels.setOwner);

  await waitTx(
    that.superOwnerCarBarContract.setOwner(that.owner.address),
    "setOwner",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      const owner = await that.superOwnerCarBarContract.owner();
      expect(owner).eq(that.owner.address);
    },
    seedData.attemps,
    seedData.delayMs,
  );

  console.log(`Owner was set to ${that.owner.address}`);
}

export async function setOwner2(that: ContextBase) {
  console.log(labels.setOwner2);

  await waitTx(
    that.superOwnerCarBarContract.setOwner(that.owner2.address),
    "setOwner",
    seedData.attemps,
    seedData.delayMs,
  );

  await attempt(
    async () => {
      const owner2 = await that.superOwnerCarBarContract.owner();
      expect(owner2).eq(that.owner2.address);
    },
    seedData.attemps,
    seedData.delayMs,
  );

  console.log(`Owner was set to ${that.owner.address}`);
}

export function shouldBehaveCorrectSmokeTest(): void {
  describe("smoke test", () => {
    beforeEach(async function () {
      await this.ownerTestUSDT.mint(this.user1.address, seedData.userInitialBalance0);
      await initCollectionsReal(this.ownerCarBarContract);
      await this.superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(0);
    });

    it(labels.smokeTest, async function () {
      await smokeTest(this);
    });

    it(labels.user1BuysToken, async function () {
      await user1BuysToken(this);
    });

    it(labels.user1TransfersToken, async function () {
      await user1BuysToken(this);
      await user1TransfersToken(this);
      await user2TransfersBackToken(this);
    });

    it(labels.onwerTransfersToken, async function () {
      await onwerTransfersToken(this);
    });

    it(labels.shopTransfersToken, async function () {
      await shopTransfersTokens(this);
    });

    it(labels.ownerUpdatesCollection, async function () {
      await ownerUpdatesCollection(this);
    });

    it(labels.ownerUpdatesToken, async function () {
      await ownerUpdatesToken(this);
    });

    it(labels.superOwnerWithdraws, async function () {
      await user1BuysToken(this);
      await superOwnerWithdraws(this);
    });

    it(labels.superOwnerWithdraws, async function () {
      await ownerTriesToWithdraw(this);
    });

    it(labels.ownerWithdrawsWithPermission, async function () {
      await user1BuysToken(this);
      await ownerWithdrawsWithPermission(this);
    });

    it(labels.setOwner, async function () {
      await setOwner(this);
    });

    it(labels.setOwner2, async function () {
      await setOwner2(this);
    });

    it(labels.owner2UpdatesToken, async function () {
      await setOwner2(this);
      await owner2UpdatesToken(this);
    });

    it(labels.ownerTriesToUpdateToken, async function () {
      await setOwner2(this);
      await ownerTriesToUpdateToken(this);
    });
  });
}
