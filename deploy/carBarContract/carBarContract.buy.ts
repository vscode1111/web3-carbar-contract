import { CAR_BAR_CONTRACT_NAME } from "constants/addresses";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TokenSoldEvent } from "typechain-types/contracts/CarBarContract";
import { callWithTimerHre, waitForTx } from "utils/common";
import { getContext } from "utils/context";

import { deployValue } from "../deployData";
import { getAddressesFromHre, getUSDTDecimalsFactor } from "../utils";

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
    const factor = await getUSDTDecimalsFactor(user1TestUSDT);

    const price = collections[deployValue.collectionId].price;
    console.log(`${price.toNumber() / factor} USDT price`);

    const allowance = await user1TestUSDT.allowance(user1.address, carBarAddress);
    console.log(`${allowance.toNumber() / factor} USDT was allowed`);

    if (price.gt(allowance)) {
      await waitForTx(user1TestUSDT.approve(carBarAddress, price), "approve");
      console.log(`${price.toNumber() / factor} USDT was approved`);
    }

    if (BUY_TOKEN) {
      const receipt = await waitForTx(
        user1CarBarContract.buyToken(deployValue.collectionId),
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
