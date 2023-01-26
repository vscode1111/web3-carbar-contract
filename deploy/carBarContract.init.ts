import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getTestCollections } from "test/carBarContract/testData";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const HOST_URL = "https://carbar.online/nft_json";
const INIT_COLLECTION = false;

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
    const adminCarBarContract = <CarBarContract>await carBarContractFactory.connect(admin).attach(contractAddress);

    console.log(`Setting init values...`);
    let tx = await adminCarBarContract.setName(`carbar_test_${deployValue.nftPostfix}`);
    await tx.wait();
    tx = await adminCarBarContract.setSymbol(`carbar_test_symbol_${deployValue.nftPostfix}`);
    await tx.wait();
    tx = await adminCarBarContract.setURI(`${HOST_URL}/${deployValue.nftPostfix}/`);
    await tx.wait();
    console.log(`Init values were set`);

    if (INIT_COLLECTION) {
      const collections = getTestCollections();

      for (const collection of collections) {
        const name = collection.name;
        console.log(`Sending transaction for collection "${name}"...`);
        const tx = await adminCarBarContract.createCollection(
          collection.name,
          collection.tokenCount,
          collection.price,
          collection.expiryDate,
        );
        console.log(`Sent transaction for collection "${name}"`);
        await tx.wait();
        console.log(`Collection "${name}" was mined`);
      }
    }
  }, hre);
};

func.tags = ["CarBarContract:init"];

export default func;
