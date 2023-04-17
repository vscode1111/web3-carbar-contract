import { callWithTimerHre } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressesFromHre, getCarBarContext, getUsers } from "utils";

import { deployData } from "../deployData";

const TOKEN_FETCH_COUNT = 3;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress } = await getAddressesFromHre(hre);
    console.log(`${CAR_BAR_CONTRACT_NAME} ${carBarAddress} is fetching...`);
    const { ownerCarBarContract } = await getCarBarContext(await getUsers(), carBarAddress);
    const name = await ownerCarBarContract.name();
    console.log("name:", name);
    const symbol = await ownerCarBarContract.symbol();
    console.log("symbol:", symbol);
    const uri = await ownerCarBarContract.uri(deployData.tokenId);
    console.log(`token #${deployData.tokenId} uri:`, uri);
    const collections = await ownerCarBarContract.fetchCollections();
    console.log("collections", collections);
    const tokens = await ownerCarBarContract.fetchTokens(deployData.collectionId);
    console.log(
      `collecton #${deployData.collectionId} tokens`,
      tokens.filter((token) => token.tokenId < TOKEN_FETCH_COUNT),
    );
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:fetch`];

export default func;
