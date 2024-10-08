import { CallData, uint256, Contract } from "starknet";
import { balanceSchema } from "./index";

export const fetchBalances = async (
  accountName: string,
  ethContract?: Contract,
  lordsContract?: Contract
): Promise<bigint[]> => {
  const ethResult = await ethContract?.call(
    "balanceOf",
    CallData.compile({ account: accountName })
  );
  const lordsBalanceResult = await lordsContract?.call(
    "balance_of",
    CallData.compile({
      account: accountName,
    })
  );
  return [
    ethResult
      ? uint256.uint256ToBN(balanceSchema.parse(ethResult).balance)
      : BigInt(0),
    lordsBalanceResult as bigint,
  ];
};
