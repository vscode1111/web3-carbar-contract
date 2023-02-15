import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

import { Sold, errorMessage, testValue } from "../testData";
import { initCollectionsReal, initCollectionsRealWithBuying, vmEsceptionText } from "../utils";

export function shouldBehaveCorrectTransfer(): void {
  describe("transfer", () => {
    it("should correct call safeTransferFrom by shop", async function () {
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);
      await this.ownerCarBarContract.setApprovalForAll(this.shop.address, true);
      await this.shopCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      await this.shopCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.Transfer);
    });

    it("should correct free Ids", async function () {
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);

      let freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(freeIds[0]).to.equal(0);
      expect(freeIds[1]).to.equal(1);
      expect(freeIds[2]).to.equal(2);
      expect(freeIds[3]).to.equal(3);
      expect(freeIds[4]).to.equal(4);

      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId1,
      );
      expect(freeIds[0]).to.equal(0);
      expect(freeIds[1]).to.equal(1);
      expect(freeIds[2]).to.equal(2);
      expect(freeIds[3]).to.equal(3);
      expect(freeIds[4]).to.equal(4);

      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId2,
      );
      expect(freeIds[0]).to.equal(0);
      expect(freeIds[1]).to.equal(1);
      expect(freeIds[2]).to.equal(2);
      expect(freeIds[3]).to.equal(3);
      expect(freeIds[4]).to.equal(4);
    });

    it("should correct call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId0);

      await this.user1CarBarContract.safeTransferFrom(
        this.user1.address,
        this.user2.address,
        0,
        1,
        testValue.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      await this.user2CarBarContract.safeTransferFrom(
        this.user2.address,
        this.user1.address,
        0,
        1,
        testValue.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);
    });

    it("should correct call safeTransferFrom with amount 2", async function () {
      await initCollectionsRealWithBuying(this, 4);
      await this.ownerCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user2.address,
        0,
        2,
        testValue.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.user2.address);
      expect(tokens[1].sold).to.equal(Sold.Transfer);
      expect(tokens[2].owner).to.equal(this.user2.address);
      expect(tokens[2].sold).to.equal(Sold.Transfer);
      expect(tokens[3].owner).to.equal(this.owner.address);
      expect(tokens[3].sold).to.equal(Sold.None);
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with incorrect length of ids and amounts", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.ownerCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [1],
          [1, 2],
          testValue.emptyData,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.dataShouldBeCorrect));
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with insufficient balance", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.ownerCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [1],
          [1],
          testValue.emptyData,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should procced safeTransfer with update by owner", async function () {
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);

      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.owner.address);
      expect(tokens[0].sold).to.equal(Sold.None);
      expect(tokens[0].expiryDate).to.equal(testValue.todayMinus1m);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(tokens[1].expiryDate).to.equal(0);

      let ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(ownerFreeIds.length).to.equal(testValue.tokenCount);
      expect(ownerFreeIds[0]).to.equal(0);
      expect(ownerFreeIds[1]).to.equal(1);
      expect(ownerFreeIds[2]).to.equal(2);
      let user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(user1FreeIds.length).to.equal(0);

      await this.ownerCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );

      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(ownerFreeIds.length).to.equal(testValue.tokenCount - 1);
      expect(ownerFreeIds[0]).to.equal(0);
      expect(ownerFreeIds[1]).to.equal(2);
      expect(ownerFreeIds[2]).to.equal(3);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(user1FreeIds.length).to.equal(1);
      expect(user1FreeIds[0]).to.equal(1);

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.owner.address);
      expect(tokens[0].sold).to.equal(Sold.None);
      expect(tokens[0].expiryDate).to.equal(testValue.todayMinus1m);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.Transfer);
      expect(tokens[1].expiryDate).to.equal(0);

      await this.ownerCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(ownerFreeIds.length).to.equal(testValue.tokenCount - 2);
      expect(ownerFreeIds[0]).to.equal(0);
      expect(ownerFreeIds[1]).to.equal(3);
      expect(ownerFreeIds[2]).to.equal(4);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(user1FreeIds.length).to.equal(2);
      expect(user1FreeIds[0]).to.equal(1);
      expect(user1FreeIds[1]).to.equal(2);

      await this.ownerCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(ownerFreeIds.length).to.equal(testValue.tokenCount - 3);
      expect(ownerFreeIds[0]).to.equal(0);
      expect(ownerFreeIds[1]).to.equal(4);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(user1FreeIds.length).to.equal(3);
      expect(user1FreeIds[0]).to.equal(1);
      expect(user1FreeIds[1]).to.equal(2);
      expect(user1FreeIds[2]).to.equal(3);

      await this.ownerCarBarContract.safeTransferFrom(
        this.owner.address,
        this.user1.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(ownerFreeIds.length).to.equal(testValue.tokenCount - 4);
      expect(ownerFreeIds[0]).to.equal(0);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(user1FreeIds.length).to.equal(4);
      expect(user1FreeIds[0]).to.equal(1);
      expect(user1FreeIds[1]).to.equal(2);
      expect(user1FreeIds[2]).to.equal(3);
      expect(user1FreeIds[3]).to.equal(4);

      await expect(
        this.ownerCarBarContract.safeTransferFrom(
          this.owner.address,
          this.user1.address,
          testValue.collectionId0,
          1,
          testValue.emptyData,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should procced safeTransfer with 1 expired token", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, testValue.price0.mul(2));
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(testValue.collectionId0);
      await this.user1CarBarContract.buyToken(testValue.collectionId0);

      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).to.equal(testValue.todayMinus1m);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].expiryDate).to.equal(0);

      await this.shopCarBarContract.safeTransferFrom(
        this.user1.address,
        this.user2.address,
        testValue.collectionId0,
        1,
        testValue.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).to.equal(testValue.todayMinus1m);
      expect(tokens[1].owner).to.equal(this.user2.address);
      expect(tokens[1].sold).to.equal(Sold.Transfer);
      expect(tokens[1].expiryDate).to.equal(0);
    });

    it("should throw error when shop tries to call safeTransfer with 2 expired token", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, testValue.price0.mul(2));
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(testValue.collectionId0);
      await this.user1CarBarContract.buyToken(testValue.collectionId0);

      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );
      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId1,
        testValue.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).to.equal(testValue.todayMinus1m);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].expiryDate).to.equal(testValue.todayMinus1m);

      await expect(
        this.shopCarBarContract.safeTransferFrom(
          this.user1.address,
          this.user2.address,
          testValue.collectionId0,
          1,
          testValue.emptyData,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should correct call safeBatchTransferFrom", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, testValue.price01);
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(testValue.collectionId0);
      await this.user1CarBarContract.buyToken(testValue.collectionId1);

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      await this.shopCarBarContract.safeBatchTransferFrom(
        this.user1.address,
        this.user2.address,
        [testValue.collectionId0, testValue.collectionId1],
        [1, 1],
        testValue.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId1);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);
    });

    it("should procced the transfer of the token from user1 and user2", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId0);

      let tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, testValue.collectionId0),
      ).to.equal(1);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, testValue.collectionId0),
      ).to.equal(testValue.zero);

      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        testValue.collectionId0,
        testValue.tokenId0,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Transfer);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, testValue.collectionId0),
      ).to.equal(testValue.zero);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, testValue.collectionId0),
      ).to.equal(1);
    });

    it("should throw error when user tries to transfer not his token", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(
        this.user1CarBarContract.transferToken(this.user1.address, this.user2.address, 1, 1),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should throw error when user tries to transfer token of an expired collection", async function () {
      await initCollectionsRealWithBuying(
        this,
        testValue.tokenCount,
        testValue.collectionId0,
        testValue.todayPlus1m,
      );
      await time.increaseTo(testValue.todayPlus1m);

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          testValue.collectionId0,
          testValue.tokenId0,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.collectionExpirationMustBeGreater));
    });

    it("should updated token correctly", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId0);
      let freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.owner.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(testValue.tokenCount - 1);
      expect(freeIds[0]).to.equal(1);
      expect(freeIds[1]).to.equal(2);
      expect(freeIds[2]).to.equal(3);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);
      expect(freeIds[0]).to.equal(0);

      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayPlus3d1m,
      );
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);

      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayPlus3d1m,
      );
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);

      await this.ownerCarBarContract.updateToken(testValue.collectionId0, testValue.tokenId0, 0);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);
      expect(freeIds[0]).to.equal(testValue.tokenId0);

      await this.ownerCarBarContract.updateToken(testValue.collectionId0, testValue.tokenId0, 0);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        testValue.collectionId0,
      );
      expect(freeIds.length).to.equal(1);
      expect(freeIds[0]).to.equal(testValue.tokenId0);
    });

    it("should procced the transfer of the updated token", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId0);
      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayPlus3d1m,
      );
      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        testValue.collectionId0,
        testValue.tokenId0,
      );

      const tokens = await this.ownerCarBarContract.fetchTokens(testValue.collectionId0);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[1].owner).to.equal(this.owner.address);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, testValue.collectionId0),
      ).to.equal(testValue.zero);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, testValue.collectionId0),
      ).to.equal(1);
    });

    it("should throw error when user tries to transfer expired token", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId0);
      await this.ownerCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          testValue.collectionId0,
          testValue.tokenId0,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.tokenExpirationMustBeMore));
    });

    it("should throw error when shop tries to transfer token without allowance", async function () {
      await initCollectionsReal(this.ownerCarBarContract, testValue.tokenCount);

      await expect(
        this.shopCarBarContract.transferToken(
          this.owner.address,
          this.user1.address,
          testValue.collectionId0,
          testValue.tokenId0,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });
  });
}
