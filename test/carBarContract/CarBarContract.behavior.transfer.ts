import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import dayjs from "dayjs";
import { toUnixTime } from "utils/common";

import { initCollectionsRealWithBuying, vmEsceptionText } from "./utils";

export function shouldBehaveCorrectTransfer(): void {
  describe("transfer", () => {
    it("should throw error when user1 tries to call safeTransferFrom", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(
        this.user1CarBarContract.safeTransferFrom(this.user1.address, this.user2.address, 0, 1, []),
      ).to.be.rejectedWith(vmEsceptionText("Ownable: caller is not the owner"));
    });

    it("should procced safeTransferFrom for admin", async function () {
      await initCollectionsRealWithBuying(this);

      await this.adminCarBarContract.safeTransferFrom(this.admin.address, this.user2.address, 0, 1, []);
    });

    it("should throw error when user1 tries to call safeBatchTransferFrom", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(
        this.user1CarBarContract.safeBatchTransferFrom(this.user1.address, this.user2.address, [0], [1], []),
      ).to.be.rejectedWith(vmEsceptionText("Ownable: caller is not the owner"));
    });

    it("should procced safeBatchTransferFrom for admin", async function () {
      await initCollectionsRealWithBuying(this);

      await this.adminCarBarContract.safeBatchTransferFrom(this.admin.address, this.user2.address, [0], [1], []);
    });

    it("should procced the transfer of the token from user1 and user2", async function () {
      const tokenCount = 5;
      const collectionId = 0;
      const tokenId = 0;

      await initCollectionsRealWithBuying(this, tokenCount, collectionId);

      let tokens = await this.adminCarBarContract.fetchTokens(collectionId);
      expect(tokens[0].owner).to.equal(this.user1.address);
      expect(tokens[0].sold).to.equal(true);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(false);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, collectionId)).to.equal(1);
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, collectionId)).to.equal(0);

      await this.user1CarBarContract.transfer(this.user2.address, collectionId, tokenId);

      tokens = await this.adminCarBarContract.fetchTokens(collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[0].sold).to.equal(true);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(tokens[1].sold).to.equal(false);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, collectionId)).to.equal(0);
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, collectionId)).to.equal(1);
    });

    it("should should throw error when user tries to transfer not his token", async function () {
      await initCollectionsRealWithBuying(this);

      await expect(this.user1CarBarContract.transfer(this.user2.address, 1, 1)).to.be.rejectedWith(
        vmEsceptionText("You must be owner of this token"),
      );
    });

    it("should should throw error when user tries to transfer token of an expired collection", async function () {
      const tokenCount = 5;
      const collectionId = 0;
      const tokenId = 0;

      const newCollectionExpiryDate = dayjs().add(1, "minute").toDate();

      await initCollectionsRealWithBuying(this, tokenCount, collectionId, toUnixTime(newCollectionExpiryDate));

      const newTokenExpiryDate = dayjs().add(1, "minute").toDate();

      await time.increaseTo(toUnixTime(newTokenExpiryDate));

      await expect(this.user1CarBarContract.transfer(this.user2.address, collectionId, tokenId)).to.be.rejectedWith(
        vmEsceptionText("Collection expiration must be greater than the current time"),
      );
    });

    it("should procced the transfer of the updated token", async function () {
      const tokenCount = 5;
      const collectionId = 0;
      const tokenId = 0;

      await initCollectionsRealWithBuying(this, tokenCount, collectionId);

      const newExpiryDate = dayjs().add(3, "day").add(1, "minute").toDate();

      await this.adminCarBarContract.updateToken(collectionId, tokenId, toUnixTime(newExpiryDate));

      await this.user1CarBarContract.transfer(this.user2.address, collectionId, tokenId);

      const tokens = await this.adminCarBarContract.fetchTokens(collectionId);
      expect(tokens[0].owner).to.equal(this.user2.address);
      expect(tokens[1].owner).to.equal(this.admin.address);
      expect(await this.adminCarBarContract.balanceOf(this.user1.address, collectionId)).to.equal(0);
      expect(await this.adminCarBarContract.balanceOf(this.user2.address, collectionId)).to.equal(1);
    });

    it("should should throw error when user tries to transfer expired token", async function () {
      const tokenCount = 5;
      const collectionId = 0;
      const tokenId = 0;

      await initCollectionsRealWithBuying(this, tokenCount, collectionId);

      const newExpiryDate = dayjs().add(-1, "minute").toDate();

      await this.adminCarBarContract.updateToken(collectionId, tokenId, toUnixTime(newExpiryDate));

      await expect(this.user1CarBarContract.transfer(this.user2.address, collectionId, tokenId)).to.be.rejectedWith(
        vmEsceptionText("Token expiration must be more than a certain period from the current time"),
      );
    });
  });
}
