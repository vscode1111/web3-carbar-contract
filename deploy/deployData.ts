import { toUnixTime } from "utils/common";

import { IMetadata } from "./types";

export const deployData = {
  collectionId: 0,
  tokenId: 0,
  today: toUnixTime(),
  nullAddress: "0x0000000000000000000000000000000000000000",
};

export const JSON_DICTIONARY: Record<string | number, IMetadata> = {
  contract: {
    name: `carbar.io v1`,
    banner: "https://carbar.io/nft/banner.png",
    image: "https://carbar.io/nft/img.png",
    description: `CAR BAR is an NFT-based car rental in Dubai (https://carbar.io/). We offer Tesla electric car fleet for 2023, allowing holders to have a flexible renting schedule and access to cars at affordable prices.
    Simply connect your wallet (Metamask or TrustWallet is required) and manage your reservation. Once you activate your personal account on the CAR BAR website and specify a pre-booking date, your NFT will get linked to this particular date.    
    Please note: to obtain a car, the driver must meet certain requirements. The rental company will also require a refundable deposit. See all the details and service terms in our FAQ.`,
  },
  //Collections
  0: {
    name: "Tesla Model 3S (1 day rental)",
    image: "https://carbar.io/nft/Tesla_Model_3_Stnd.png",
    description: `This NFT entitles you to 1 day of Tesla Model 3 Standard rental in Dubai from February 15, 2023 to May 31, 2023.
    CAR BAR is an NFT-based car rental in Dubai (https://carbar.io/). We offer Tesla electric car fleet for 2023, allowing holders to have a flexible renting schedule and access to cars at affordable prices.
    Simply connect your wallet (Metamask or TrustWallet is required) and manage your reservation. Once you activate your personal account on the CAR BAR website and specify a pre-booking date, your NFT will get linked to this particular date.
    Please note: to obtain a car, the driver must meet certain requirements. The rental company will also require a refundable deposit. See all the details and service terms in our FAQ.`,
  },
  1: {
    name: "Tesla Model 3P (1 day rental)",
    image: "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
    description: `This NFT entitles you to 1 day of Tesla Model 3 Standard rental in Dubai from February 15, 2023 to May 31, 2023.
    CAR BAR is an NFT-based car rental in Dubai (https://carbar.io/). We offer Tesla electric car fleet for 2023, allowing holders to have a flexible renting schedule and access to cars at affordable prices.
    Simply connect your wallet (Metamask or TrustWallet is required) and manage your reservation. Once you activate your personal account on the CAR BAR website and specify a pre-booking date, your NFT will get linked to this particular date.
    Please note: to obtain a car, the driver must meet certain requirements. The rental company will also require a refundable deposit. See all the details and service terms in our FAQ.`,
  },
  2: {
    name: "Tesla Model Y (1 day rental)",
    image: "https://carbar.io/nft/Tesla_Y.png",
    description: `This NFT entitles you to 1 day of Tesla Model 3 Standard rental in Dubai from February 15, 2023 to May 31, 2023.
    CAR BAR is an NFT-based car rental in Dubai (https://carbar.io/). We offer Tesla electric car fleet for 2023, allowing holders to have a flexible renting schedule and access to cars at affordable prices.
    Simply connect your wallet (Metamask or TrustWallet is required) and manage your reservation. Once you activate your personal account on the CAR BAR website and specify a pre-booking date, your NFT will get linked to this particular date.
    Please note: to obtain a car, the driver must meet certain requirements. The rental company will also require a refundable deposit. See all the details and service terms in our FAQ.`,
  },
};
