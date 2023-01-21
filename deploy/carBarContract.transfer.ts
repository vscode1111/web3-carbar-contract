import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

const USER_ADDRESS = "0x8E05d1F687d12eBBAA704a9c614d425bc13A3643";
const COLLECTION_ID = 0;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    console.log(`CarBarContract [${contractAddress}] starts simulation...`);

    const [admin] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
    const carBarContract = <CarBarContract>await carBarContractFactory.connect(admin).attach(contractAddress);

    let tx = await carBarContract.safeTransferFrom(admin.address, USER_ADDRESS, COLLECTION_ID, 1, []);
    console.log(`Call safeTransferFrom...`);
    await tx.wait();
    console.log(`Token of ${COLLECTION_ID} collection was safeTransfered`);
  });
};

func.tags = ["CarBarContract:transfer"];

export default func;
