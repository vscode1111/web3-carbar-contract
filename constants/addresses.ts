import { DeployNetworks } from "types/common";

export enum CONTRACT_LIST {
  CAR_BAR = "CAR_BAR",
}

export enum TOKEN_LIST {
  USDT = "USDT",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  CAR_BAR: {
    mumbai: "0x4996FC03735B44b53531530a02A0EDd7C6e19b69",
    // polygon: "0x26ab88bcA08DbC6A1Fd54deDAc45cB8757E5Ea44",
    polygon: "0xCda48131854De037470f99A1D896Ef4f4B0D3D7e",
  },
};

export const TOKENS: Record<TOKEN_LIST, DeployNetworks> = {
  USDT: {
    mumbai: "0x584a302B104530C8cd376d06dFe857CEAB409766",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
};
