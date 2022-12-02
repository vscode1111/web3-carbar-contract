import { DeployNetworks } from "types/common";

export enum CONTRACT_LIST {
  CAR_BAR = "CAR_BAR",
}

export enum TOKEN_LIST {
  USDT = "USDT",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  CAR_BAR: {
    mumbai: "0x6d170e1A233e81ee5bCfB7727e74370DD88F2faB",
    polygon: "",
  },
};

export const TOKENS: Record<TOKEN_LIST, DeployNetworks> = {
  USDT: {
    mumbai: "0x07373cF6939092183e84E465114c575f2089A0Eb",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
};
