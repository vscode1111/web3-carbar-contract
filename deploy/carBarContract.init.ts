import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getTestCollections } from "test/carBarContract/data";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    console.log(`CarBarContract [${contractAddress}] is initiating...`);

    const [admin] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>await ethers.getContractFactory("CarBarContract");
    const carBarContract = <CarBarContract>await carBarContractFactory.connect(admin).attach(contractAddress);

    console.log(`Setting init values...`);
    let tx = await carBarContract.setName("carbar_test");
    await tx.wait();
    tx = await carBarContract.setSymbol("carbar_test_symbol");
    await tx.wait();
    tx = await carBarContract.setURI("http://20.68.212.46:8081/nft_json/x1_");
    await tx.wait();
    console.log(`Init values were set`);

    const collections = getTestCollections();

    for (const collection of collections) {
      const name = collection.name;
      console.log(`Sending transaction for collection "${name}"...`);
      const tx = await carBarContract.createCollection(
        collection.name,
        collection.tokenCount,
        collection.price,
        collection.expiryDate,
      );
      console.log(`Sent transaction for collection "${name}"`);
      await tx.wait();
      console.log(`Collection "${name}" was mined`);
    }
  });
};

func.tags = ["CarBarContract:init"];

export default func;
