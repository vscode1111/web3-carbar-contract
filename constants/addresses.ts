export enum TOKEN_LIST {
  USDT = "USDT",
}

export const TOKENS: Record<TOKEN_LIST, { polygon: string; mumbai: string }> = {
  USDT: {
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    mumbai: "0x07373cF6939092183e84E465114c575f2089A0Eb",
  },
};
