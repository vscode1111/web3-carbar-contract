import { CONTRACTS, TOKENS } from "constants/addresses";
import { ContractTransaction } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CarBarContract, TokenSoldEvent } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { DeployNetworks } from "types/common";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";
import { getUSDTDecimalsFactor } from "./utils";

const BUY_TOKEN = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimer(async () => {
    const {
      ethers,
      network: { name },
    } = hre;
    const carBarAddress = CONTRACTS.CAR_BAR[name as keyof DeployNetworks];
    const usdtAddress = TOKENS.USDT[name as keyof DeployNetworks];

    console.log(`CarBarContract [${carBarAddress}] starts buying...`);

    const [, user] = await hre.ethers.getSigners();

    const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
    const testUSDT = <TestUSDT>await testUSDTFactory.connect(user).attach(usdtAddress);

    const carBarContractFactory = <CarBarContract__factory>(
      await ethers.getContractFactory("CarBarContract")
    );
    const carBarContract = <CarBarContract>(
      await carBarContractFactory.connect(user).attach(carBarAddress)
    );

    const collections = await carBarContract.fetchCollections();
    const factor = await getUSDTDecimalsFactor(testUSDT);

    const price = collections[deployValue.collectionId].price;
    console.log(`${price.toNumber() / factor} USDT price`);

    const allowance = await testUSDT.allowance(user.address, carBarAddress);
    console.log(`${allowance.toNumber() / factor} USDT was allowed`);

    let tx: ContractTransaction;

    if (price.gt(allowance)) {
      tx = await testUSDT.approve(carBarAddress, price);
      console.log(`Call approve...`);
      await tx.wait();
      console.log(`${price.toNumber() / factor} USDT was approved`);
    }

    if (BUY_TOKEN) {
      tx = await carBarContract.buyToken(deployValue.collectionId);
      console.log(`Call buyToken...`);
      const receipt = await tx.wait();
      const tokenSoldEvent = receipt.events?.find(
        (item) => item.event === "TokenSold",
      ) as TokenSoldEvent;
      const { collectionId, tokenId } = tokenSoldEvent?.args;

      console.log(`Token ${collectionId}/${tokenId} was bought`);
    }
  }, hre);
};

func.tags = ["CarBarContract:buy"];

export default func;
