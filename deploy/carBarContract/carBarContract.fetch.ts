import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { callWithTimer } from "utils/common";
import { getCarBarContext, getUsers } from "utils/context";

import { deployValue } from "../deployData";
import { getAddressesFromHre } from "../utils";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is fetching...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);
    // const collections = await ownerCarBarContract.fetchCollections();
    // console.log(collections);
    const tokens = await ownerCarBarContract.fetchTokens(deployValue.collectionId);
    console.log(tokens.filter((token) => token.tokenId < 10));
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:fetch`];

export default func;
