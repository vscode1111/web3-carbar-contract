import { expect } from "chai";
import { ContextBase } from "test/types";
import { CarBarContract, TokenSoldEvent } from "typechain-types/contracts/CarBarContract";
import { waitForTx } from "utils/common";

import { testValue } from "../testData";
import { getNow, initCollectionsReal } from "../utils";

function findTokenCount(tokens: CarBarContract.TokenItemStructOutput[], address: string) {
  return tokens.filter((token) => token.owner === address).length;
}

export async function smokeTest(that: ContextBase, init = true) {
  if (init) {
    await that.ownerTestUSDT.mint(that.user1.address, testValue.userInitialBalance0);
    await initCollectionsReal(that.ownerCarBarContract);
  }

  const superOwnerAddress = await that.ownerCarBarContract.superOwner();

  //-------------------------------------
  console.log("1.User1 buys token");
  await waitForTx(
    that.user1TestUSDT.approve(that.ownerCarBarContract.address, testValue.price0),
    "approve",
  );

  let tokens = await that.ownerCarBarContract.fetchTokens(testValue.collectionId0);
  let user1TokenCount0 = findTokenCount(tokens, that.user1.address);

  const receipt = await waitForTx(
    that.user1CarBarContract.buyToken(testValue.collectionId0),
    "buyToken",
  );

  tokens = await that.ownerCarBarContract.fetchTokens(testValue.collectionId0);
  let user1TokenCount1 = findTokenCount(tokens, that.user1.address);
  expect(user1TokenCount1).eq(user1TokenCount0 + 1);

  const tokenSoldEvent = receipt.events?.find(
    (item) => item.event === "TokenSold",
  ) as TokenSoldEvent;

  expect(tokenSoldEvent).to.not.be.undefined;

  const { collectionId, tokenId, seller, owner, price, timestamp } = tokenSoldEvent?.args;

  expect(collectionId).to.be.equal(testValue.collectionId0);
  expect(tokenId).to.be.greaterThanOrEqual(0);
  expect(seller).to.be.equal(that.superOwner.address);
  expect(owner).to.be.equal(that.user1.address);
  expect(price).to.be.equal(testValue.price0);
  expect(timestamp).to.be.closeTo(getNow(), testValue.timeDelta);

  //-------------------------------------
  console.log("2.User1 transfers token");
  user1TokenCount0 = findTokenCount(tokens, that.user1.address);
  await waitForTx(
    that.ownerCarBarContract.safeTransferFrom(
      superOwnerAddress,
      that.user1.address,
      testValue.collectionId0,
      1,
      testValue.emptyData,
    ),
    "safeTransferFrom",
  );

  tokens = await that.ownerCarBarContract.fetchTokens(testValue.collectionId0);
  user1TokenCount1 = findTokenCount(tokens, that.user1.address);
  expect(user1TokenCount1).eq(user1TokenCount0 + 1);

  //-------------------------------------
  console.log("3.User1 transfers back token");
  user1TokenCount0 = findTokenCount(tokens, that.user1.address);
  await waitForTx(
    that.user1CarBarContract.safeTransferFrom(
      that.user1.address,
      superOwnerAddress,
      testValue.collectionId0,
      1,
      testValue.emptyData,
    ),
    "safeTransferFrom",
  );

  tokens = await that.ownerCarBarContract.fetchTokens(testValue.collectionId0);
  user1TokenCount1 = findTokenCount(tokens, that.user1.address);
  expect(user1TokenCount1).eq(user1TokenCount0 - 1);

  //-------------------------------------
  // console.log("4.Onwer transfers token of superOwner with permission");
  // user1TokenCount0 = findTokenCount(tokens, that.user1.address);
  // await waitForTx(
  //   that.ownerCarBarContract.safeTransferFrom(
  //     that.user1.address,
  //     superOwnerAddress,
  //     testValue.collectionId0,
  //     1,
  //     testValue.emptyData,
  //   ),
  //   "safeTransferFrom",
  // );

  // tokens = await that.ownerCarBarContract.fetchTokens(testValue.collectionId0);
  // user1TokenCount1 = findTokenCount(tokens, that.user1.address);
  // expect(user1TokenCount1).eq(user1TokenCount0 - 1);

  //-------------------------------------
  console.log("5.Owner updates token");
  let token = await that.ownerCarBarContract.fetchToken(
    testValue.collectionId0,
    testValue.tokenId0,
  );
  const owner_ = token.owner;
  const sold = token.sold;

  await waitForTx(
    that.ownerCarBarContract.updateToken(
      testValue.collectionId0,
      testValue.tokenId0,
      testValue.today,
    ),
    "updateToken",
  );

  token = await that.ownerCarBarContract.fetchToken(testValue.collectionId0, testValue.tokenId0);

  expect(token.tokenId).to.eq(testValue.tokenId0);
  expect(token.owner).to.eq(owner_);
  expect(token.expiryDate).to.eq(testValue.today);
  expect(token.sold).to.eq(sold);
}

export function shouldBehaveCorrectSmoke(): void {
  describe("smoke test", () => {
    it("it should be run correctly", async function () {
      await smokeTest(this);
    });
  });
}
