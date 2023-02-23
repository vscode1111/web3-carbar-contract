export const errorMessage = {
  onlySuperOwnerOrOwner: "Only superOwner or owner has right to call this function",
  onlySuperOwnerOrPermittedOwner:
    "Only superOwner or owner who has permission can call this function",
  youMustBeOwnerOrApproved: "You must be owner of this token or approved",
  priceMustBeGreaterZero: "Price must be greater than zero",
  userMustAllowToUseFunds: "User must allow to use of funds",
  userMustHaveFunds: "User must have funds",
  collectionMustHave1token: "The collection must have at least 1 available token",
  collectionExpirationMustBeGreater: "Collection expiration must be greater than the current time",
  tokenExpirationMustBeMore:
    "Token expiration must be more than a certain period from the current time",
  contractMustHaveSufficientFunds: "Contract must have sufficient funds",
  dataShouldBeCorrect: "Length of ids, amounts should be the correct",
  insufficientBalance: "ERC1155: insufficient balance for transfer",
  noFreeTokenId: "There is no free tokenId",
  couldntFindValidFreeId: "Couldn't find valid free id",
};

export enum Sold {
  None,
  Transfer,
  TokenSold,
}

export enum Roles {
  SUPER_OWNER_ROLE = "0x8b1505cddb35f62ac075d7162e97e437accb1359b84bdfe7c73611681f2dc87c",
  OWNER_ROLE = "0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e",
}
