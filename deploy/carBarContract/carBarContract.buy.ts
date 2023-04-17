import { callWithTimerHre, toNumberDecimals, waitTx } from "common";
import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TokenSoldEvent } from "typechain-types/contracts/CarBarContract";
import { getAddressesFromHre, getContext } from "utils";

import { deployData } from "../deployData";

const BUY_TOKEN = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { carBarAddress, usdtAddress } = await getAddressesFromHre(hre);

    console.log(`${CAR_BAR_CONTRACT_NAME} [${carBarAddress}] starts buying...`);

    const { user1, user1TestUSDT, user1CarBarContract } = await getContext(
      carBarAddress,
      usdtAddress,
    );

    const collections = await user1CarBarContract.fetchCollections();

    const price = collections[deployData.collectionId].price;

    const decimals = await user1TestUSDT.decimals();

    console.log(`${toNumberDecimals(price, decimals)} USDT price`);

    const allowance = await user1TestUSDT.allowance(user1.address, carBarAddress);
    console.log(`${toNumberDecimals(allowance, decimals)} USDT was allowed`);

    if (price.gt(allowance)) {
      await waitTx(user1TestUSDT.approve(carBarAddress, price), "approve");
      console.log(`${toNumberDecimals(price, decimals)} USDT was approved`);
    }

    if (BUY_TOKEN) {
      const receipt = await waitTx(
        user1CarBarContract.buyToken(deployData.collectionId),
        "buyToken",
      );
      const tokenSoldEvent = receipt.events?.find(
        (item) => item.event === "TokenSold",
      ) as TokenSoldEvent;
      const { collectionId, tokenId } = tokenSoldEvent?.args;

      console.log(`Token ${collectionId}/${tokenId} was bought`);
    }
  }, hre);
};

func.tags = [`${CAR_BAR_CONTRACT_NAME}:buy`];

export default func;
