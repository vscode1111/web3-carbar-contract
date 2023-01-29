import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import { shouldBehaveCorrectFetching } from "./carBarContract.behavior.fetching";
import { shouldBehaveCorrectPayment } from "./carBarContract.behavior.payment";
import { shouldBehaveCorrectTransfer } from "./carBarContract.behavior.transfer";
import { deployCarBarContractFixture } from "./carBarContract.fixture";

describe("CarBarContract", function () {
  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.admin = signers[0];
    this.user1 = signers[1];
    this.user2 = signers[2];
    this.shop = signers[3];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const {
      adminTestUSDT,
      user1TestUSDT,
      user2TestUSDT,
      adminCarBarContract,
      user1CarBarContract,
      user2CarBarContract,
      shopCarBarContract,
    } = await this.loadFixture(deployCarBarContractFixture);
    this.adminTestUSDT = adminTestUSDT;
    this.user1TestUSDT = user1TestUSDT;
    this.user2TestUSDT = user2TestUSDT;
    this.adminCarBarContract = adminCarBarContract;
    this.user1CarBarContract = user1CarBarContract;
    this.user2CarBarContract = user2CarBarContract;
    this.shopCarBarContract = shopCarBarContract;
  });

  shouldBehaveCorrectFetching();
  shouldBehaveCorrectPayment();
  shouldBehaveCorrectTransfer();
});
