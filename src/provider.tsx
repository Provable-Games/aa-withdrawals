"use client";
import React from "react";
import {
  StarknetConfig,
  starkscan,
  jsonRpcProvider,
} from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";
import { Chain } from "@starknet-react/chains";
import { networkConfig } from "./lib/networkConfig";
import { useInjectedConnectors } from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  function rpc(_chain: Chain) {
    return {
      nodeUrl: networkConfig.rpcUrl!,
    };
  }

  const { connectors } = useInjectedConnectors({
    // Randomize the order of the connectors.
    order: "random",
  });

  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet]}
      connectors={[...connectors]}
      explorer={starkscan}
      provider={jsonRpcProvider({ rpc })}
    >
      {children}
    </StarknetConfig>
  );
}
