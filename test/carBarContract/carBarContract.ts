import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";

import { shouldBehaveCorrectFetching } from "./carBarContract.behavior.fetching";
import { shouldBehaveCorrectForking } from "./carBarContract.behavior.forking";
import { shouldBehaveCorrectPayment } from "./carBarContract.behavior.payment";
import { shouldBehaveCorrectRoles } from "./carBarContract.behavior.roles";
import { shouldBehaveCorrectSmoke } from "./carBarContract.behavior.smoke-test";
import { shouldBehaveCorrectTransfer } from "./carBarContract.behavior.transfer";
import { deployCarBarContractFixture } from "./carBarContract.fixture";

describe(CAR_BAR_CONTRACT_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    // console.log(111, this.currentTest?.parent?.title, this.currentTest?.title);
    const {
      owner,
      user1,
      user2,
      shop,
      superOwner,
      owner2,
      ownerTestUSDT,
      user1TestUSDT,
      user2TestUSDT,
      ownerCarBarContract,
      user1CarBarContract,
      user2CarBarContract,
      shopCarBarContract,
      superOwnerCarBarContract,
      owner2CarBarContract,
    } = await this.loadFixture(deployCarBarContractFixture);

    this.owner = owner;
    this.user1 = user1;
    this.user2 = user2;
    this.shop = shop;
    this.superOwner = superOwner;
    this.owner2 = owner2;
    this.ownerTestUSDT = ownerTestUSDT;
    this.user1TestUSDT = user1TestUSDT;
    this.user2TestUSDT = user2TestUSDT;
    this.ownerCarBarContract = ownerCarBarContract;
    this.user1CarBarContract = user1CarBarContract;
    this.user2CarBarContract = user2CarBarContract;
    this.shopCarBarContract = shopCarBarContract;
    this.superOwnerCarBarContract = superOwnerCarBarContract;
    this.owner2CarBarContract = owner2CarBarContract;
  });

  shouldBehaveCorrectFetching();
  shouldBehaveCorrectPayment();
  shouldBehaveCorrectTransfer();
  shouldBehaveCorrectForking();
  shouldBehaveCorrectRoles();
  shouldBehaveCorrectSmoke();
});
