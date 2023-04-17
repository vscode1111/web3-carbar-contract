import { DeployNetworks } from "types";

export const CAR_BAR_CONTRACT_NAME = "CarBarContract";
export const USDT_CONTRACT_NAME = "TestUSDT";

export enum CONTRACT_LIST {
  CAR_BAR = "CAR_BAR",
}

export enum TOKEN_LIST {
  USDT = "USDT",
}

export enum ACCOUNT_LIST {
  SUPER_OWNER = "SUPER_OWNER",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  CAR_BAR: {
    opera: "0xB4a13C969E2fA3d95B7EC0b5253761616A2E4bE5",
    // polygon: "0x0259d6571C0B9bcc6e19190c7e6C10FA20aA7Ef0", //test
    // polygon: "0x18cbBeF3285d31e3b08b7487D5a5FF527e5E2674", //!prod
    polygon: "0x0eE882B84964C8f3634a333DF34F607f5085050B", //myTest
    okc: "0xC1498646753909Af352CbE92c48f526A0c732D07", //test
  },
};

export const TOKENS: Record<TOKEN_LIST, DeployNetworks> = {
  USDT: {
    opera: "0x049d68029688eAbF473097a2fC38ef61633A3C7A",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    okc: "0x382bb369d343125bfb2117af9c149795c6c65c50",
  },
};

export const ACCOUNTS: Record<ACCOUNT_LIST, DeployNetworks> = {
  SUPER_OWNER: {
    opera: "0xe54D298953F65c47DbbE48F2a958E337a12392c6",
    polygon: "0xe54D298953F65c47DbbE48F2a958E337a12392c6", //myTest
    // polygon: "0xBE387fa4Bd4a309e26796299CDfc7E245B19A331", //!prod
    okc: "0xe54D298953F65c47DbbE48F2a958E337a12392c6", //test
  },
};
