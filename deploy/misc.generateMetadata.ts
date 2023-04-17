import appRoot from "app-root-path";
import { callWithTimerHre } from "common";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

import { jsonDictionary } from "./deployData";

const func: DeployFunction = async (): Promise<void> => {
  await callWithTimerHre(async () => {
    const dir = `${appRoot.toString()}/nft`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    Object.entries(jsonDictionary).forEach(([key, value]) => {
      fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(value, null, 2));
    });
  });
};

func.tags = ["misc:generate-metadata"];

export default func;
