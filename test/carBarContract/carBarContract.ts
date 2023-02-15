import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import { shouldBehaveCorrectFetching } from "./carBarContract.behavior.fetching";
import { shouldBehaveCorrectForking } from "./carBarContract.behavior.forking";
import { shouldBehaveCorrectPayment } from "./carBarContract.behavior.payment";
import { shouldBehaveCorrectRoles } from "./carBarContract.behavior.roles";
import { shouldBehaveCorrectTransfer } from "./carBarContract.behavior.transfer";
import { deployCarBarContractFixture } from "./carBarContract.fixture";

describe("CarBarContract", function () {
  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.owner = signers[0];
    this.user1 = signers[1];
    this.user2 = signers[2];
    this.shop = signers[3];
    this.superOwner = signers[4];
    this.owner2 = signers[5];

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {
    const {
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
});
