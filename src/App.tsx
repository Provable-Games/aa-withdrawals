import { useState } from "react";
import { networkConfig } from "./lib/networkConfig";
import { fetchBalances } from "./lib/balances";
import { indexAddress, displayAddress } from "./lib/index";
import {
  useAccount,
  useContract,
  useConnect,
  useDisconnect,
  useTransactionReceipt,
} from "@starknet-react/core";
import Lords from "./abi/Lords.json";
import EthBalanceFragment from "./abi/EthBalanceFragment.json";
import { Abi, CallData } from "starknet";
import { useEffect } from "react";
import "./App.css";

function App() {
  const [arcadeAddress, setArcadeAddress] = useState("");
  const [ethBalance, setEthBalance] = useState(0n);
  const [lordsBalance, setLordsBalance] = useState(0n);
  const [masterAccount, setMasterAccount] = useState("");
  const [txHash, setTxHash] = useState("");

  const { contract: lordsContract } = useContract({
    address: networkConfig.lordsAddress as `0x${string}`,
    abi: Lords as Abi,
  });
  const { contract: ethContract } = useContract({
    address: networkConfig.ethAddress as `0x${string}`,
    abi: EthBalanceFragment as Abi,
  });

  const { account, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isLoading, isSuccess, status } = useTransactionReceipt({
    hash: txHash,
  });

  const ethAddress = networkConfig.ethAddress;
  const lordsAddress = networkConfig.lordsAddress;

  const getBalances = async () => {
    const balances = await fetchBalances(
      indexAddress(arcadeAddress ?? "0x0").toLowerCase(),
      ethContract,
      lordsContract
    );
    setEthBalance(balances[0]);
    setLordsBalance(balances[1]);
  };

  const handleWithdrawal = async () => {
    const txCalls = [
      {
        contractAddress: arcadeAddress ?? "",
        entrypoint: "function_call",
        calldata: [
          lordsBalance > 0n ? "2" : "1",
          ...CallData.compile({
            contractAddress: ethAddress ?? "",
            entrypoint: "transfer",
            calldata: [address ?? "", ethBalance, "0x0"],
          }),
          ...(lordsBalance > 0n
            ? CallData.compile({
                contractAddress: lordsAddress ?? "",
                entrypoint: "transfer",
                calldata: [address ?? "", lordsBalance, "0x0"],
              })
            : []),
        ],
      },
    ];

    const tx = await account?.execute(txCalls);
    setTxHash(tx?.transaction_hash ?? "");
  };

  const getMasterAccount = async () => {
    const masterAccountCall = {
      contractAddress: arcadeAddress ?? "",
      entrypoint: "get_master_account",
      calldata: [],
    };
    const masterAccount = await account?.callContract(masterAccountCall);
    setMasterAccount(
      indexAddress(masterAccount!.toString().toLowerCase()) ?? "0x0"
    );
  };

  useEffect(() => {
    getBalances();
  }, [arcadeAddress, isSuccess]);

  useEffect(() => {
    getMasterAccount();
  }, [arcadeAddress]);

  return (
    <>
      <h1>AA Withdrawals</h1>
      {!account ? (
        <div>
          {connectors.map((connector) => (
            <button key={connector.id} onClick={() => connect({ connector })}>
              Connect with {connector.id}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p>Connected to {displayAddress(address as string)}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}
      <div className="card">
        <p>Enter AA Address:</p>
        <input
          className="large-input"
          value={arcadeAddress}
          onChange={(e) => setArcadeAddress(e.target.value)}
        />
        <div>
          <p>ETH: {ethBalance.toString()}</p>
          <p>Lords: {lordsBalance.toString()}</p>
        </div>
        <button
          onClick={handleWithdrawal}
          disabled={
            masterAccount !== indexAddress(address ?? "0x0").toLowerCase()
          }
        >
          Withdraw
        </button>
        {isLoading && <p>{status}</p>}
      </div>
    </>
  );
}

export default App;
