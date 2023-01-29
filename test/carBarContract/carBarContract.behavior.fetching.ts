import { expect } from "chai";

import { testValue } from "../testData";
import { checkToken, getCollectionName, initCollections, initCollectionsReal } from "../utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return the correct URI once it's changed", async function () {
      const testText = "http://www.test.com/nft_json/";
      const tokenId = 0;
      await this.adminCarBarContract.setURI(testText);
      const result = await this.adminCarBarContract.uri(tokenId);
      expect(result).to.equal(`${testText}${tokenId}.json`);
    });

    it("should return the correct collections and tokens", async function () {
      const adminAddress = this.admin.address;

      const resultTokenCount = await this.adminCarBarContract.getCollectionCount();
      expect(resultTokenCount).to.equal(0);

      await initCollections(this.adminCarBarContract, testValue.collectionCount);

      const collections = await this.adminCarBarContract.fetchCollections();

      expect(collections.length).to.equal(testValue.collectionCount);

      for (let i = 0; i < testValue.collectionCount; i++) {
        const collection = collections[i];

        const balance = await this.adminCarBarContract.balanceOf(
          adminAddress,
          collection.collectionId,
        );
        expect(balance).to.eq(collection.tokenCount);

        expect(collection.collectionId).to.eq(i);
        expect(collection.collectionName).to.eq(getCollectionName(i));
        expect(collection.tokenCount).to.eq(i + 1);
        expect(collection.price).to.eq(i + 2);
        expect(collection.expiryDate).to.eq(i + 3);

        const tokens = await this.adminCarBarContract.fetchTokens(collection.collectionId);
        const tokenCount = collection.tokenCount;
        expect(tokens.length).to.eq(tokenCount);

        for (let j = 0; j < tokenCount; j++) {
          const token = tokens[i];
          checkToken(token, i, adminAddress);

          const fetchToken = await this.adminCarBarContract.fetchToken(collection.collectionId, i);
          checkToken(fetchToken, i, adminAddress);
        }
      }
    });

    it("Should be correct update certain collection", async function () {
      await initCollections(this.adminCarBarContract, testValue.collectionCount);

      await this.adminCarBarContract.updateCollection(
        testValue.collectionId0,
        getCollectionName(10),
      );

      const collection = await this.adminCarBarContract.fetchCollection(testValue.collectionId0);

      expect(collection.collectionId).to.eq(testValue.collectionId0);
      expect(collection.collectionName).to.eq(getCollectionName(10));
      expect(collection.tokenCount).to.eq(testValue.collectionId0 + 1);
      expect(collection.price).to.eq(testValue.collectionId0 + 2);
      expect(collection.expiryDate).to.eq(testValue.collectionId0 + 3);
    });

    it("Should be correct update certain token", async function () {
      await initCollections(this.adminCarBarContract, testValue.collectionCount);

      let token = await this.adminCarBarContract.fetchToken(
        testValue.collectionId0,
        testValue.tokenId0,
      );
      const owner = token.owner;
      const sold = token.sold;

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.today,
      );

      token = await this.adminCarBarContract.fetchToken(
        testValue.collectionId0,
        testValue.tokenId0,
      );

      expect(token.tokenId).to.eq(testValue.tokenId0);
      expect(token.owner).to.eq(owner);
      expect(token.expiryDate).to.eq(testValue.today);
      expect(token.sold).to.eq(sold);
    });

    it("Should be correct balanceOf", async function () {
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount);

      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount);

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );

      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount - 1);

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId1,
        testValue.todayMinus1m,
      );

      expect(
        await this.adminCarBarContract.balanceOf(this.admin.address, testValue.collectionId0),
      ).to.equal(testValue.tokenCount - 2);
    });

    it("Should be correct balanceOf", async function () {
      await initCollectionsReal(this.adminCarBarContract, testValue.tokenCount);

      expect(
        await this.adminCarBarContract.balanceOfBatch(
          [this.admin.address],
          [testValue.collectionId0],
        ),
      ).to.deep.equal([testValue.tokenCount]);

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId0,
        testValue.todayMinus1m,
      );

      expect(
        await this.adminCarBarContract.balanceOfBatch(
          [this.admin.address],
          [testValue.collectionId0],
        ),
      ).to.deep.equal([testValue.tokenCount - 1]);

      await this.adminCarBarContract.updateToken(
        testValue.collectionId0,
        testValue.tokenId1,
        testValue.todayMinus1m,
      );

      expect(
        await this.adminCarBarContract.balanceOfBatch(
          [this.admin.address],
          [testValue.collectionId0],
        ),
      ).to.deep.equal([testValue.tokenCount - 2]);
    });

    it("Should be correct USDT address", async function () {
      const result = await this.adminCarBarContract.getUSDTaddress();
      expect(result).to.eq(this.adminTestUSDT.address);
    });
  });
}