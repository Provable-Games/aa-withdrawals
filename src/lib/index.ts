import { z } from "zod";

export const uint256Schema = z.object({
  low: z.bigint(),
  high: z.bigint(),
});

export const balanceSchema = z.object({
  balance: uint256Schema,
});

export function indexAddress(address: string) {
  return address.replace(/^0x0+/, "0x");
}

export function displayAddress(string: string) {
  if (string === undefined) return "unknown";
  return string.substring(0, 6) + "..." + string.substring(string.length - 4);
}
