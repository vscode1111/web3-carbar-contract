import { getCarBarContext, getUsdtContext, getUsers } from "utils";

import { ContextBase } from "../types";

export async function deployCarBarContractFixture(): Promise<ContextBase> {
  const users = await getUsers();
  const { superOwner } = users;

  const { ownerTestUSDT, user1TestUSDT, user2TestUSDT } = await getUsdtContext(users);

  const {
    ownerCarBarContract,
    user1CarBarContract,
    user2CarBarContract,
    shopCarBarContract,
    superOwnerCarBarContract,
    owner2CarBarContract,
  } = await getCarBarContext(users, {
    superOwnerAddress: superOwner.address,
    usdtAddress: ownerTestUSDT.address,
  });

  await ownerCarBarContract.deployed();

  await superOwnerCarBarContract.giveSuperOwnerPermissionToOwner(1);

  return {
    ...users,
    ownerTestUSDT,
    user1TestUSDT,
    user2TestUSDT,
    ownerCarBarContract,
    user1CarBarContract,
    user2CarBarContract,
    shopCarBarContract,
    superOwnerCarBarContract,
    owner2CarBarContract,
  };
}
