import { expect } from "chai";
import { seedData } from "seeds/seedData";

import { checkToken, getCollectionName, initCollections, initCollectionsReal } from "../utils";

export function shouldBehaveCorrectFetching(): void {
  describe("fetching", () => {
    it("should return the correct URI once it's changed", async function () {
      const testText = "http://www.test.com/nft_json/";
      const tokenId = 0;
      await this.ownerCarBarContract.setURI(testText);
      const result = await this.ownerCarBarContract.uri(tokenId);
      expect(result).equal(`${testText}${tokenId}.json`);
    });

    it("should return the correct collections and tokens", async function () {
      const superOwnerAddress = this.superOwner.address;

      const resultTokenCount = await this.ownerCarBarContract.getCollectionCount();
      expect(resultTokenCount).equal(0);

      await initCollections(this.ownerCarBarContract, seedData.collectionCount);

      const collections = await this.ownerCarBarContract.fetchCollections();

      expect(collections.length).equal(seedData.collectionCount);

      for (let i = 0; i < seedData.collectionCount; i++) {
        const collection = collections[i];

        const balance = await this.ownerCarBarContract.balanceOf(
          superOwnerAddress,
          collection.collectionId,
        );
        expect(balance).eq(collection.tokenCount);

        expect(collection.collectionId).eq(i);
        expect(collection.collectionName).eq(getCollectionName(i));
        expect(collection.tokenCount).eq(i + 1);
        expect(collection.price).eq(i + 2);
        expect(collection.expiryDate).eq(i + 3);

        const tokens = await this.ownerCarBarContract.fetchTokens(collection.collectionId);
        const tokenCount = collection.tokenCount;
        expect(tokens.length).eq(tokenCount);

        for (let j = 0; j < tokenCount; j++) {
          const token = tokens[i];
          checkToken(token, i, superOwnerAddress);

          const fetchToken = await this.ownerCarBarContract.fetchToken(collection.collectionId, i);
          checkToken(fetchToken, i, superOwnerAddress);
        }
      }
    });

    it("should be correct update certain collection", async function () {
      await initCollections(this.ownerCarBarContract, seedData.collectionCount);

      await this.ownerCarBarContract.updateCollection(
        seedData.collectionId0,
        getCollectionName(10),
      );

      const collection = await this.ownerCarBarContract.fetchCollection(seedData.collectionId0);

      expect(collection.collectionId).eq(seedData.collectionId0);
      expect(collection.collectionName).eq(getCollectionName(10));
      expect(collection.tokenCount).eq(seedData.collectionId0 + 1);
      expect(collection.price).eq(seedData.collectionId0 + 2);
      expect(collection.expiryDate).eq(seedData.collectionId0 + 3);
    });

    it("should be correct update certain token", async function () {
      await initCollections(this.ownerCarBarContract, seedData.collectionCount);

      let token = await this.ownerCarBarContract.fetchToken(
        seedData.collectionId0,
        seedData.tokenId0,
      );
      const owner = token.owner;
      const sold = token.sold;

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.today,
      );

      token = await this.ownerCarBarContract.fetchToken(seedData.collectionId0, seedData.tokenId0);

      expect(token.tokenId).eq(seedData.tokenId0);
      expect(token.owner).eq(owner);
      expect(token.expiryDate).eq(seedData.today);
      expect(token.sold).eq(sold);
    });

    it("should be correct balanceOf", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);

      expect(
        await this.ownerCarBarContract.balanceOf(this.superOwner.address, seedData.collectionId0),
      ).equal(seedData.tokenCount);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );

      expect(
        await this.ownerCarBarContract.balanceOf(this.superOwner.address, seedData.collectionId0),
      ).equal(seedData.tokenCount - 1);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId1,
        seedData.todayMinus1m,
      );

      expect(
        await this.ownerCarBarContract.balanceOf(this.superOwner.address, seedData.collectionId0),
      ).equal(seedData.tokenCount - 2);
    });

    it("should be correct balanceOf", async function () {
      await initCollectionsReal(this.ownerCarBarContract, seedData.tokenCount);

      expect(
        await this.ownerCarBarContract.balanceOfBatch(
          [this.superOwner.address],
          [seedData.collectionId0],
        ),
      ).deep.equal([seedData.tokenCount]);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId0,
        seedData.todayMinus1m,
      );

      expect(
        await this.ownerCarBarContract.balanceOfBatch(
          [this.superOwner.address],
          [seedData.collectionId0],
        ),
      ).deep.equal([seedData.tokenCount - 1]);

      await this.ownerCarBarContract.updateToken(
        seedData.collectionId0,
        seedData.tokenId1,
        seedData.todayMinus1m,
      );

      expect(
        await this.ownerCarBarContract.balanceOfBatch(
          [this.superOwner.address],
          [seedData.collectionId0],
        ),
      ).deep.equal([seedData.tokenCount - 2]);
    });

    it("should be correct USDT address", async function () {
      const result = await this.ownerCarBarContract.getUSDTaddress();
      expect(result).eq(this.ownerTestUSDT.address);
    });
  });
}
