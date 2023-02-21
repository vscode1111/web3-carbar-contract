import { DeployNetworks } from "types/common";

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
    polygon: "0x0259d6571C0B9bcc6e19190c7e6C10FA20aA7Ef0",
  },
};

export const TOKENS: Record<TOKEN_LIST, DeployNetworks> = {
  USDT: {
    opera: "0x049d68029688eAbF473097a2fC38ef61633A3C7A",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
};

export const ACCOUNTS: Record<ACCOUNT_LIST, DeployNetworks> = {
  SUPER_OWNER: {
    opera: "0xe54D298953F65c47DbbE48F2a958E337a12392c6",
    polygon: "0xe54D298953F65c47DbbE48F2a958E337a12392c6",
  },
};
