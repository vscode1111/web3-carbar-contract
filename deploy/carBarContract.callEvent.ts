import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    const [admin] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
    const adminCarBarContract = <CarBarContract>await carBarContractFactory.connect(admin).attach(contractAddress);

    let tx = await adminCarBarContract.callEventTransferSingle(
      admin.address,
      deployValue.fromAddress,
      deployValue.toAddress,
      deployValue.collectionId,
      1,
    );
    console.log(`Call callEventTransferSingle...`);
    await tx.wait();
  }, hre);
};

func.tags = ["CarBarContract:call-event"];

export default func;
