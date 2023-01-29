import appRoot from "app-root-path";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";
import { callWithTimer } from "utils/common";

import { deployValue } from "./deployData";

interface IMetadata {
  name: string;
  image: string;
  banner?: string;
  description: string;
}

const CONTRACT_NAME = `carbar_test_${deployValue.nftPostfix}`;

const DICTIONARY: Record<string | number, IMetadata> = {
  contract: {
    name: CONTRACT_NAME,
    image:
      "https://shiftdelete.net/wp-content/uploads/2022/02/tesla-uygulama-magazasi-bu-yil-tanitabilir1.jpg",
    banner: "https://cdn.webrazzi.com/uploads/2015/09/tesla-model-x3.jpg",
    description: `${CONTRACT_NAME} description`,
  },
  0: {
    name: "TEST Model Stnd",
    image: "https://carbar.io/nft/Tesla_Model_3_Stnd.png",
    description: `TEST Model Stn test description. ${CONTRACT_NAME}`,
  },
  1: {
    name: "TEST Model Prfm",
    image: "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
    description: `TEST Model Prfm test description. ${CONTRACT_NAME}`,
  },
  2: {
    name: "TEST Model Y",
    image: "https://carbar.io/nft/Tesla_Y.png",
    description: `TEST Model Y test description. ${CONTRACT_NAME}`,
  },
};

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimer(async () => {
    const dir = `${appRoot.toString()}/nft/${deployValue.nftPostfix}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    Object.entries(DICTIONARY).forEach(([key, value]) => {
      fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(value, null, 2));
    });
  });
};

func.tags = ["misc:generate-metadata"];

export default func;
