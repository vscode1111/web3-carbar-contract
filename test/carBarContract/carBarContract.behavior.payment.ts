import { expect } from "chai";
import { TokenSoldEvent } from "typechain-types/contracts/CarBarContract";

import { Sold, errorMessage, testValue } from "../testData";
import { initCollectionsReal, initCollectionsRealWithBuying, vmEsceptionText } from "../utils";

export function shouldBehaveCorrectPayment(): void {
  describe("payment", () => {
    it("should return 0 balances for admin and all users", async function () {
      const adminBalance = await this.adminTestUSDT.balanceOf(this.admin.address);
      expect(adminBalance).to.equal(testValue.zero);

      const user1Balance = await this.adminTestUSDT.balanceOf(this.user1.address);
      expect(user1Balance).to.equal(testValue.zero);

      const user2Balance = await this.adminTestUSDT.balanceOf(this.user2.address);
      expect(user2Balance).to.equal(testValue.zero);
    });

    it("should return correct balances for admin and all users after minting", async function () {
      await this.adminTestUSDT.mint(this.admin.address, testValue.userInitialBalance0);
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance1);
      await this.adminTestUSDT.mint(this.user2.address, testValue.userInitialBalance2);

      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.zero,
      );
      expect(await this.adminTestUSDT.balanceOf(this.admin.address)).to.equal(
        testValue.userInitialBalance0,
      );
      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(
        testValue.userInitialBalance1,
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(
        testValue.userInitialBalance2,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance012);
    });

    it("should procced the payment of the token by the user", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await initCollectionsReal(this.adminCarBarContract);

      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price0);

      const tx = await this.user1CarBarContract.buyToken(testValue.collectionId0);
      const receipt = await tx.wait();

      const tokenSoldEvent = receipt.events?.find(
        (item) => item.event === "TokenSold",
      ) as TokenSoldEvent;

      expect(tokenSoldEvent).to.not.be.undefined;

      const { collectionId, tokenId, seller, owner, price, timestamp } = tokenSoldEvent?.args;

      const now = Math.round(new Date().getTime() / 1000);

      expect(collectionId).to.be.equal(testValue.collectionId0);
      expect(tokenId).to.be.equal(0);
      expect(seller).to.be.equal(this.admin.address);
      expect(owner).to.be.equal(this.user1.address);
      expect(price).to.be.equal(testValue.price0);
      expect(timestamp).to.be.closeTo(now, 30);

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(
        testValue.userInitialBalance0.sub(testValue.price0),
      );
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.price0,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should procced the payment of the token by the user after update token", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await initCollectionsReal(this.adminCarBarContract);

      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price0);

      const timeGap = await this.adminCarBarContract.TIME_GAP();

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        timeGap - 1,
      );

      await this.user1CarBarContract.buyToken(testValue.collectionId0);

      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).to.equal(timeGap - 1);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[1].expiryDate).to.equal(0);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      expect(tokens[2].expiryDate).to.equal(0);
    });

    it("should procced the payment of the token of second collection by the user", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await initCollectionsReal(this.adminCarBarContract);

      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price1);

      const tx = await this.user1CarBarContract.buyToken(testValue.collectionId1);
      const receipt = await tx.wait();

      const tokenSoldEvent = receipt.events?.find(
        (item) => item.event === "TokenSold",
      ) as TokenSoldEvent;

      expect(tokenSoldEvent).to.not.be.undefined;

      const { collectionId, tokenId, seller, owner, price, timestamp } = tokenSoldEvent?.args;

      const now = Math.round(new Date().getTime() / 1000);

      expect(collectionId).to.be.equal(testValue.collectionId1);
      expect(tokenId).to.be.equal(0);
      expect(seller).to.be.equal(this.admin.address);
      expect(owner).to.be.equal(this.user1.address);
      expect(price).to.be.equal(testValue.price1);
      expect(timestamp).to.be.closeTo(now, 30);

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(
        testValue.userInitialBalance0.sub(testValue.price1),
      );
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.price1,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should throw error when user tries to buy token withount allowance", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await initCollectionsReal(this.adminCarBarContract);

      await expect(this.user1CarBarContract.buyToken(0)).to.be.rejectedWith(
        vmEsceptionText(errorMessage.userMustAllowToUseFunds),
      );

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(
        testValue.userInitialBalance0,
      );
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.zero,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should throw error when user tries to buy token withount funds", async function () {
      await initCollectionsReal(this.adminCarBarContract);

      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price01);

      await expect(this.user1CarBarContract.buyToken(0)).to.be.rejectedWith(
        vmEsceptionText(errorMessage.userMustHaveFunds),
      );

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(testValue.zero);
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.zero,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.zero);
    });

    it("should throw error when user tries to buy token from empty collection", async function () {
      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price01);

      await expect(this.user1CarBarContract.buyToken(0)).to.be.rejectedWith(
        vmEsceptionText(errorMessage.collectionMustHave1token),
      );

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(testValue.zero);
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.zero,
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.zero);
    });

    it("should withdraw funds to user2 by admin", async function () {
      await this.adminTestUSDT.mint(
        this.adminCarBarContract.address,
        testValue.userInitialBalance0,
      );

      await this.adminCarBarContract.withdraw(this.user2.address, testValue.price1);

      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.userInitialBalance0.sub(testValue.price1),
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(testValue.price1);
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should throw error when not admin tries to withdraw token", async function () {
      await this.adminTestUSDT.mint(
        this.adminCarBarContract.address,
        testValue.userInitialBalance0,
      );

      await expect(
        this.user1CarBarContract.withdraw(this.user2.address, testValue.price1),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.ownable));

      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.userInitialBalance0,
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(testValue.zero);
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should throw error when admin tries to withdraw more tokens", async function () {
      await this.adminTestUSDT.mint(
        this.adminCarBarContract.address,
        testValue.userInitialBalance0,
      );

      await expect(
        this.adminCarBarContract.withdraw(this.user2.address, testValue.userInitialBalance1),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.contractMustHaveSufficientFunds));

      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.userInitialBalance0,
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(testValue.zero);
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should throw error when not admin tries to withdraw token", async function () {
      await this.adminTestUSDT.mint(
        this.adminCarBarContract.address,
        testValue.userInitialBalance0,
      );

      await expect(
        this.user1CarBarContract.withdraw(this.user2.address, testValue.price0),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.ownable));

      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.userInitialBalance0,
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(testValue.zero);
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0);
    });

    it("should procced the payment of the token by the user1 and user2", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price01);
      await this.adminTestUSDT.mint(this.user2.address, testValue.userInitialBalance0);
      await this.user2TestUSDT.approve(this.adminCarBarContract.address, testValue.price01);
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount);

      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount);

      //Check initial state of collection #0
      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(tokens[0].sold).to.equal(Sold.None);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      //Check initial state of collection #1
      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(tokens[0].sold).to.equal(Sold.None);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);

      let freeIds = await this.adminCarBarContract.fetchFreeIds(
        this.admin.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(testValue.tokenCount);
      expect(freeIds[0]).to.equal(0);
      expect(freeIds[1]).to.equal(1);
      expect(freeIds[2]).to.equal(2);

      //User1 buys token of collection #0
      await this.user1CarBarContract.buyToken(testValue.collectionId0);
      freeIds = await this.adminCarBarContract.fetchFreeIds(
        this.admin.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(testValue.tokenCount - 1);
      expect(freeIds[0]).to.equal(1);
      expect(freeIds[1]).to.equal(2);
      expect(freeIds[2]).to.equal(3);
      freeIds = await this.adminCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);
      expect(freeIds[0]).to.equal(0);

      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount - 1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId0),
      ).to.equal(1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId0),
      ).to.equal(testValue.zero);

      //User2 buys token of collection #0
      await this.user2CarBarContract.buyToken(testValue.collectionId0);
      freeIds = await this.adminCarBarContract.fetchFreeIds(
        this.admin.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(testValue.tokenCount - 2);
      expect(freeIds[0]).to.equal(2);
      expect(freeIds[1]).to.equal(3);
      expect(freeIds[2]).to.equal(4);
      freeIds = await this.adminCarBarContract.fetchFreeIds(
        this.user2.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);
      expect(freeIds[0]).to.equal(1);
      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.user2.address);
      expect(tokens[1].sold).to.equal(Sold.TokenSold);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount - 2);
      expect(
        await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId0),
      ).to.equal(1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId0),
      ).to.equal(1);

      //Check initial state of collection #1
      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.admin.address);
      expect(tokens[0].sold).to.equal(Sold.None);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);

      //User1 buys token of collection #1
      await this.user1CarBarContract.buyToken(testValue.collectionId1);
      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId1),
      ).to.equal(testValue.tokenCount - 1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId1),
      ).to.equal(1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId1),
      ).to.equal(testValue.zero);

      //User2 buys token of collection #0
      await this.user2CarBarContract.buyToken(testValue.collectionId1);
      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.user2.address);
      expect(tokens[1].sold).to.equal(Sold.TokenSold);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId1),
      ).to.equal(testValue.tokenCount - 2);
      expect(
        await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId1),
      ).to.equal(1);
      expect(
        await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId1),
      ).to.equal(1);

      expect(await this.adminTestUSDT.balanceOf(this.user1.address)).to.equal(
        testValue.userInitialBalance0.sub(testValue.price01),
      );
      expect(await this.adminTestUSDT.balanceOf(this.user2.address)).to.equal(
        testValue.userInitialBalance0.sub(testValue.price01),
      );
      expect(await this.adminTestUSDT.balanceOf(this.adminCarBarContract.address)).to.equal(
        testValue.price01.mul(2),
      );
      expect(await this.adminTestUSDT.totalSupply()).to.equal(testValue.userInitialBalance0.mul(2));
    });

    it("should should throw error when user tries to buy token of an expired collection", async function () {
      await expect(
        initCollectionsRealWithBuying(
          this,
          testValue.tokenCount,
          testValue.collectionId0,
          testValue.todayMinus1m,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.collectionExpirationMustBeGreater));
    });
  });
}
