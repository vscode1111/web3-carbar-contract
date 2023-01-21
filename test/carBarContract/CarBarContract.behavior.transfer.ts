import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import dayjs from "dayjs";
import { numberToByteArray, toUnixTime } from "utils/common";

import { Sold, errorMessage, testValue } from "./data";
import { initCollectionsReal, initCollectionsRealWithBuying, vmEsceptionText } from "./utils";

export function shouldBehaveCorrectTransfer(): void {
  describe("transfer", () => {
    it("should correct call safeTransferFrom by shop", async function () {
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount);
      await this.adminCarBarContract.setApprovalForAll(this.shop.address, true);
      await this.shopCarBarContract.safeTransferFrom(
        this.admin.address,
        this.user1.address,
        testValue.collectionId,
        1,
        [],
      );

      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.Trasfer);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);

      await this.shopCarBarContract.safeTransferFrom(
        this.admin.address,
        this.user1.address,
        testValue.collectionId,
        1,
        [],
      );

      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.Trasfer);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.Trasfer);
    });

    it("should correct call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId);

      await this.user1CarBarContract.safeTransferFrom(
        this.user1.address,
        this.user2.address,
        0,
        1,
        numberToByteArray(0),
      );

      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Trasfer);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
    });

    it("should throw error when user1 tries to call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.user1CarBarContract.safeTransferFrom(this.user1.address, this.user2.address, 0, 1, numberToByteArray(1)),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should throw error when user1 tries to call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.user1CarBarContract.safeTransferFrom(this.user1.address, this.user2.address, 0, 2, numberToByteArray(0)),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.amountMustBe1));
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with incorrect length of ids and amounts", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.adminCarBarContract.safeBatchTransferFrom(this.user1.address, this.user2.address, [1], [1, 2], []),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.dataShouldBeCorrect));
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with incorrect length of ids and data", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.adminCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [1],
          [1],
          numberToByteArray(0, 2),
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.dataShouldBeCorrect));
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom with incorrect array of amounts", async function () {
      await initCollectionsRealWithBuying(this);
      await expect(
        this.adminCarBarContract.safeBatchTransferFrom(
          this.user1.address,
          this.user2.address,
          [0],
          [2],
          numberToByteArray(0),
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.amountMustBe1));
    });

    it("should correct call safeBatchTransferFrom", async function () {
      await this.adminTestUSDT.mint(this.user1.address, testValue.userInitialBalance0);
      await this.user1TestUSDT.approve(this.adminCarBarContract.address, testValue.price0.mul(2));
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount, testValue.endTime2023);
      await this.user1CarBarContract.buyToken(testValue.collectionId);
      await this.user1CarBarContract.buyToken(testValue.collectionId);

      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.user1.address);
      expect(tokens[1].sold).to.equal(Sold.TokenSold);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);

      await this.user1CarBarContract.safeBatchTransferFrom(
        this.user1.address,
        this.user2.address,
        [0, 0],
        [1, 1],
        [...numberToByteArray(0), ...numberToByteArray(1)],
      );

      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Trasfer);
      expect(tokens[1].owner).to.equal(this.user2.address);
      expect(tokens[1].sold).to.equal(Sold.Trasfer);
      expect(tokens[2].owner).to.equal(this.admin.address);
      expect(tokens[2].sold).to.equal(Sold.None);
    });

    it("should procced the transfer of the token from user1 and user2", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId);

      let tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(Sold.TokenSold);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId)).to.equal(1);
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId)).to.equal(
        testValue.zero,
      );

      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        testValue.collectionId,
        testValue.tokenId,
      );

      tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(Sold.Trasfer);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(Sold.None);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId)).to.equal(
        testValue.zero,
      );
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId)).to.equal(1);
    });

    it("should throw error when user tries to transfer not his token", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(
        this.user1CarBarContract.transferToken(this.user1.address, this.user2.address, 1, 1),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });

    it("should should throw error when user tries to transfer token of an expired collection", async function () {
      const newCollectionExpiryDate = dayjs().add(1, "minute").toDate();
      await initCollectionsRealWithBuying(
        this,
        testValue.tokenCount,
        testValue.collectionId,
        toUnixTime(newCollectionExpiryDate),
      );
      const newTokenExpiryDate = dayjs().add(1, "minute").toDate();
      await time.increaseTo(toUnixTime(newTokenExpiryDate));

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          testValue.collectionId,
          testValue.tokenId,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.collectionExpirationMustBeGreater));
    });

    it("should procced the transfer of the updated token", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId);
      const newExpiryDate = dayjs().add(3, "day").add(1, "minute").toDate();
      await this.adminCarBarContract.updateToken(testValue.collectionId, testValue.tokenId, toUnixTime(newExpiryDate));
      await this.user1CarBarContract.transferToken(
        this.user1.address,
        this.user2.address,
        testValue.collectionId,
        testValue.tokenId,
      );

      const tokens = await this.adminCarBarContract.fetchTokens(testValue.collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, testValue.collectionId)).to.equal(
        testValue.zero,
      );
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, testValue.collectionId)).to.equal(1);
    });

    it("should throw error when user tries to transfer expired token", async function () {
      await initCollectionsRealWithBuying(this, testValue.tokenCount, testValue.collectionId);
      const newExpiryDate = dayjs().add(-1, "minute").toDate();
      await this.adminCarBarContract.updateToken(testValue.collectionId, testValue.tokenId, toUnixTime(newExpiryDate));

      await expect(
        this.user1CarBarContract.transferToken(
          this.user1.address,
          this.user2.address,
          testValue.collectionId,
          testValue.tokenId,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.tokenExpirationMustBeMore));
    });

    it("should throw error when shop tries to transfer token without allowance", async function () {
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount);

      await expect(
        this.shopCarBarContract.transferToken(
          this.admin.address,
          this.user1.address,
          testValue.collectionId,
          testValue.tokenId,
        ),
      ).to.be.rejectedWith(vmEsceptionText(errorMessage.youMustBeOwnerOrApproved));
    });
  });
}
