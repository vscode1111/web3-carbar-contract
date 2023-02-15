import { CONTRACTS } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getTestCollections } from "test/testData";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

const HOST_URL = "https://carbar.online/nft_json";
const INIT_COLLECTION = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const contractAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];

    console.log(`CarBarContract ${contractAddress} is initiating...`);

    const [owner] = await hre.ethers.getSigners();

    const carBarContractFactory = <CarBarContract__factory>(
      await ethers.getContractFactory("CarBarContract")
    );
    const ownerCarBarContract = <CarBarContract>(
      await carBarContractFactory.connect(owner).attach(contractAddress)
    );

    console.log(`Setting init values...`);
    let tx = await ownerCarBarContract.setName(`carbar_test_${deployValue.nftPostfix}`);
    console.log(111, tx.hash);
    await tx.wait();
    tx = await ownerCarBarContract.setSymbol(`carbar_test_symbol_${deployValue.nftPostfix}`);
    await tx.wait();
    tx = await ownerCarBarContract.setURI(`${HOST_URL}/${deployValue.nftPostfix}/`);
    await tx.wait();
    console.log(`Init values were set`);

    if (INIT_COLLECTION) {
      const collections = getTestCollections();

      for (const collection of collections) {
        const name = collection.name;
        console.log(`Sending transaction for collection "${name}"...`);
        const tx = await ownerCarBarContract.createCollection(
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
