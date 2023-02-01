import { CONTRACTS, TOKENS } from "constants/addresses";
import { ethers, upgrades } from "hardhat";
import { CarBarContract } from "typechain-types/contracts/CarBarContract";
import { TestUSDT } from "typechain-types/contracts/TestUSDT";
import { CarBarContract__factory } from "typechain-types/factories/contracts/CarBarContract__factory";
import { TestUSDT__factory } from "typechain-types/factories/contracts/TestUSDT__factory";
import { DeployNetworks } from "types/common";

export function shouldBehaveCorrectForking(): void {
  describe.skip("forking", () => {
    it("incident: buy token of collection #1 in 38747028 block", async function () {
      // const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
      // const latestBlock = await provider.getBlock("latest");
      // console.log(111, latestBlock);

      const collectionId = 1;

      const name: keyof DeployNetworks = "polygon";
      const carBarAddress = CONTRACTS.CAR_BAR[name];
      const usdtAddress = TOKENS.USDT[name];

      const admin = await ethers.getImpersonatedSigner(
        "0x90Aa0e69acF6ebeD3a124625DD14A19aE8AA81b1",
      );
      const user = await ethers.getImpersonatedSigner("0x2Dd61D433319B0D0A446592376fC3613E70d686A");
      const testUSDTFactory = <TestUSDT__factory>await ethers.getContractFactory("TestUSDT");
      const userTestUSDT = <TestUSDT>await testUSDTFactory.connect(user).attach(usdtAddress);

      const carBarContractFactory = <CarBarContract__factory>(
        await ethers.getContractFactory("CarBarContract")
      );
      const adminCarBarContractFactory = carBarContractFactory.connect(admin);

      // const userCarBarContract = <CarBarContract>(
      //   await carBarContractFactory.connect(user).attach(carBarAddress)
      // );

      await upgrades.forceImport(carBarAddress, adminCarBarContractFactory);

      const adminCarBarContract = <CarBarContract>(
        await upgrades.upgradeProxy(carBarAddress, adminCarBarContractFactory)
      );
      const userCarBarContract = adminCarBarContract.connect(user);

      const collections = await userCarBarContract.fetchCollections();

      const price = collections[collectionId].price;

      await userTestUSDT.approve(carBarAddress, price);

      await userCarBarContract.buyToken(collectionId);
    });
  });
}