import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { vmEsceptionText } from "common";
import { seedData } from "seeds/seedData";

import { Sold, errorMessage } from "../testData";
import { initCollectionsReal, initCollectionsRealWithBuying } from "../utils";

export function shouldBehaveCorrectTransfer(): void {
  describe("transfer", () => {
    it("should correct call safeTransferFrom by shop", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.superOwnerCarBarContract.setApprovalForAll(this.shop.address, true);
      await this.shopCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      await this.shopCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.user1.address);
      expect(tokens[1].sold).equal(Sold.Transfer);
    });

    it("owner is allowed to trasfer superOwner's tokens", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.ownerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      await this.ownerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.user1.address);
      expect(tokens[1].sold).equal(Sold.Transfer);
    });

    it("owner is allowed to trasfer superOwner's tokens", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      await expect(
        this.ownerCarBarContract.safeTransferFrom(
          this.user1.address,
          this.user2.address,
          seedData.collectionId0,
          1,
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should throw error when shop try to transfer token was approved non-superOwner", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.ownerCarBarContract.setApprovalForAll(this.shop.address, true);
      await expect(
        this.shopCarBarContract.safeTransferFrom(
          this.superOwner.address,
          this.user1.address,
          seedData.collectionId0,
          1,
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should correct free Ids", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);

      let freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(freeIds[0]).equal(0);
      expect(freeIds[1]).equal(1);
      expect(freeIds[2]).equal(2);
      expect(freeIds[3]).equal(3);
      expect(freeIds[4]).equal(4);

      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId1,
      );
      expect(freeIds[0]).equal(0);
      expect(freeIds[1]).equal(1);
      expect(freeIds[2]).equal(2);
      expect(freeIds[3]).equal(3);
      expect(freeIds[4]).equal(4);

      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId2,
      );
      expect(freeIds[0]).equal(0);
      expect(freeIds[1]).equal(1);
      expect(freeIds[2]).equal(2);
      expect(freeIds[3]).equal(3);
      expect(freeIds[4]).equal(4);
    });

    it("should correct call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this, seedData.tokenCount, seedData.collectionId0);

      await this.user1CarBarContract.safeTransferFrom(
        this.user1.address,
        this.user2.address,
        0,
        1,
        seedData.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user2.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      await this.user2CarBarContract.safeTransferFrom(
        this.user2.address,
        this.user1.address,
        0,
        1,
        seedData.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);
    });

    it("should correct call safeTransferFrom with amount 2", async function () {
      await initCollectionsRealWithBuying(this, 4);
      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user2.address,
        0,
        2,
        seedData.emptyData,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[1].owner).equal(this.user2.address);
      expect(tokens[1].sold).equal(Sold.Transfer);
      expect(tokens[2].owner).equal(this.user2.address);
      expect(tokens[2].sold).equal(Sold.Transfer);
      expect(tokens[3].owner).equal(this.superOwner.address);
      expect(tokens[3].sold).equal(Sold.None);
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with incorrect length of ids and amounts", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.ownerCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [1],
          [1, 2],
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.dataShouldBeCorrect));
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with insufficient balance", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.ownerCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [1],
          [1],
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should procced safeTransfer with update by owner", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.superOwner.address);
      expect(tokens[0].sold).equal(Sold.None);
      expect(tokens[0].expiryDate).equal(seedData.todayMinus1m);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);
      expect(tokens[1].expiryDate).equal(0);

      let ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(ownerFreeIds.length).equal(seedData.tokenCount);
      expect(ownerFreeIds[0]).equal(0);
      expect(ownerFreeIds[1]).equal(1);
      expect(ownerFreeIds[2]).equal(2);
      let user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(user1FreeIds.length).equal(0);

      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(ownerFreeIds.length).equal(seedData.tokenCount - 1);
      expect(ownerFreeIds[0]).equal(0);
      expect(ownerFreeIds[1]).equal(2);
      expect(ownerFreeIds[2]).equal(3);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(user1FreeIds.length).equal(1);
      expect(user1FreeIds[0]).equal(1);

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.superOwner.address);
      expect(tokens[0].sold).equal(Sold.None);
      expect(tokens[0].expiryDate).equal(seedData.todayMinus1m);
      expect(tokens[1].owner).equal(this.user1.address);
      expect(tokens[1].sold).equal(Sold.Transfer);
      expect(tokens[1].expiryDate).equal(0);

      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(ownerFreeIds.length).equal(seedData.tokenCount - 2);
      expect(ownerFreeIds[0]).equal(0);
      expect(ownerFreeIds[1]).equal(3);
      expect(ownerFreeIds[2]).equal(4);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(user1FreeIds.length).equal(2);
      expect(user1FreeIds[0]).equal(1);
      expect(user1FreeIds[1]).equal(2);

      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(ownerFreeIds.length).equal(seedData.tokenCount - 3);
      expect(ownerFreeIds[0]).equal(0);
      expect(ownerFreeIds[1]).equal(4);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(user1FreeIds.length).equal(3);
      expect(user1FreeIds[0]).equal(1);
      expect(user1FreeIds[1]).equal(2);
      expect(user1FreeIds[2]).equal(3);

      await this.superOwnerCarBarContract.safeTransferFrom(
        this.superOwner.address,
        this.user1.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );
      ownerFreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(ownerFreeIds.length).equal(seedData.tokenCount - 4);
      expect(ownerFreeIds[0]).equal(0);
      user1FreeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(user1FreeIds.length).equal(4);
      expect(user1FreeIds[0]).equal(1);
      expect(user1FreeIds[1]).equal(2);
      expect(user1FreeIds[2]).equal(3);
      expect(user1FreeIds[3]).equal(4);

      await expect(
        this.superOwnerCarBarContract.safeTransferFrom(
          this.superOwner.address,
          this.user1.address,
          seedData.collectionId0,
          1,
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should procced safeTransfer with 1 expired token", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, seedData.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, seedData.price0.mul(2));
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(seedData.collectionId0);
      await this.user1CarBarContract.buyToken(seedData.collectionId0);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).equal(seedData.todayMinus1m);
      expect(tokens[1].owner).equal(this.user1.address);
      expect(tokens[1].sold).equal(Sold.TokenSold);
      expect(tokens[1].expiryDate).equal(0);

      await this.shopCarBarContract.safeTransferFrom(
        this.user1.address,
        this.user2.address,
        seedData.collectionId0,
        1,
        seedData.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).equal(seedData.todayMinus1m);
      expect(tokens[1].owner).equal(this.user2.address);
      expect(tokens[1].sold).equal(Sold.Transfer);
      expect(tokens[1].expiryDate).equal(0);
    });

    it("should throw error when shop tries to call safeTransfer with 2 expired token", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, seedData.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, seedData.price0.mul(2));
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(seedData.collectionId0);
      await this.user1CarBarContract.buyToken(seedData.collectionId0);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );
      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId1,
        seedData.todayMinus1m,
      );

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[0].expiryDate).equal(seedData.todayMinus1m);
      expect(tokens[1].owner).equal(this.user1.address);
      expect(tokens[1].sold).equal(Sold.TokenSold);
      expect(tokens[1].expiryDate).equal(seedData.todayMinus1m);

      await expect(
        this.shopCarBarContract.safeTransferFrom(
          this.user1.address,
          this.user2.address,
          seedData.collectionId0,
          1,
          seedData.emptyData,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.couldntFindValidFreeId));
    });

    it("should correct call safeBatchTransferFrom", async function () {
      await this.ownerTestUSDT.mint(this.user1.address, seedData.userInitialBalance0);
      await this.user1TestUSDT.approve(this.ownerCarBarContract.address, seedData.price01);
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);
      await this.user1CarBarContract.setApprovalForAll(this.shop.address, true);
      await this.user1CarBarContract.buyToken(seedData.collectionId0);
      await this.user1CarBarContract.buyToken(seedData.collectionId1);

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId1);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      await this.shopCarBarContract.safeBatchTransferFrom(
        this.user1.address,
        this.user2.address,
        [seedData.collectionId0, seedData.collectionId1],
        [1, 1],
        seedData.emptyData,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user2.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId1);
      expect(tokens[0].owner).equal(this.user2.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);
    });

    it("should procced the transfer of the token from user1 and user2", async function () {
      await initCollectionsRealWithBuying(this, seedData.tokenCount, seedData.collectionId0);

      let tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user1.address);
      expect(tokens[0].sold).equal(Sold.TokenSold);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, seedData.collectionId0),
      ).equal(1);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, seedData.collectionId0),
      ).equal(seedData.zero);

      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        seedData.collectionId0,
        seedData.tokenId0,
      );

      tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user2.address);
      expect(tokens[0].sold).equal(Sold.Transfer);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(tokens[1].sold).equal(Sold.None);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, seedData.collectionId0),
      ).equal(seedData.zero);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, seedData.collectionId0),
      ).equal(1);
    });

    it("should throw error when user tries to transfer not his token", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(
        this.user1CarBarContract.transferToken(this.user1.address, this.user2.address, 1, 1),
      ).rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should throw error when user tries to transfer token of an expired collection", async function () {
      await initCollectionsRealWithBuying(
        this,
        seedData.tokenCount,
        seedData.collectionId0,
        seedData.todayPlus1m,
      );
      await time.increaseTo(seedData.todayPlus1m);

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          seedData.collectionId0,
          seedData.tokenId0,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.collectionExpirationMustBeGreater));
    });

    it("should updated token correctly", async function () {
      await initCollectionsRealWithBuying(this, seedData.tokenCount, seedData.collectionId0);
      let freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.superOwner.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(seedData.tokenCount - 1);
      expect(freeIds[0]).equal(1);
      expect(freeIds[1]).equal(2);
      expect(freeIds[2]).equal(3);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(1);
      expect(freeIds[0]).equal(0);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayPlus3d1m,
      );
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(1);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayPlus3d1m,
      );
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(1);

      await this.ownerCarBarContract.updateToken(seedData.collectionId0, seedData.tokenId0, 0);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(1);
      expect(freeIds[0]).equal(seedData.tokenId0);

      await this.ownerCarBarContract.updateToken(seedData.collectionId0, seedData.tokenId0, 0);
      freeIds = await this.ownerCarBarContract.fetchFreeIds(
        this.user1.address,
        seedData.collectionId0,
      );
      expect(freeIds.length).equal(1);
      expect(freeIds[0]).equal(seedData.tokenId0);
    });

    it("should procced the transfer of the updated token", async function () {
      await initCollectionsRealWithBuying(this, seedData.tokenCount, seedData.collectionId0);
      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayPlus3d1m,
      );
      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        seedData.collectionId0,
        seedData.tokenId0,
      );

      const tokens = await this.ownerCarBarContract.fetchTokens(seedData.collectionId0);
      expect(tokens[0].owner).equal(this.user2.address);
      expect(tokens[1].owner).equal(this.superOwner.address);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user1.address, seedData.collectionId0),
      ).equal(seedData.zero);
      expect(
        await this.ownerCarBarContract.balanceOf(this.user2.address, seedData.collectionId0),
      ).equal(1);
    });

    it("should throw error when user tries to transfer expired token", async function () {
      await initCollectionsRealWithBuying(this, seedData.tokenCount, seedData.collectionId0);
      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          seedData.collectionId0,
          seedData.tokenId0,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.tokenExpirationMustBeMore));
    });

    it("should throw error when shop tries to transfer token without allowance", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);

      await expect(
        this.shopCarBarContract.transferToken(
          this.superOwner.address,
          this.user1.address,
          seedData.collectionId0,
          seedData.tokenId0,
        ),
      ).rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });
  });
}
