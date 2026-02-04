import axios from "axios";

export const MAX_COUNT = "0x3e8";
export const DECIMALS = 18n;

export const CHAINS = {
  bsc: {
    name: "BNB Chain",
    rpc: (key) => `https://bnb-mainnet.g.alchemy.com/v2/${key}`,
  },
  eth: {
    name: "Ethereum",
    rpc: (key) => `https://eth-mainnet.g.alchemy.com/v2/${key}`,
  },
  polygon: {
    name: "Polygon",
    rpc: (key) => `https://polygon-mainnet.g.alchemy.com/v2/${key}`,
  },
  arbitrum: {
    name: "Arbitrum",
    rpc: (key) => `https://arb-mainnet.g.alchemy.com/v2/${key}`,
  },
  base: {
    name: "Base",
    rpc: (key) => `https://base-mainnet.g.alchemy.com/v2/${key}`,
  },
};

export async function getContractCreationBlock(address, rpc) {
  const latest = BigInt(
    (
      await axios.post(rpc, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      })
    ).data.result
  );

  let low = 0n;
  let high = latest;

  while (low < high) {
    const mid = (low + high) / 2n;

    const code = (
      await axios.post(rpc, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "0x" + mid.toString(16)],
      })
    ).data.result;

    if (code === "0x") low = mid + 1n;
    else high = mid;
  }

  if (low === latest) throw new Error("Address is not a contract");
  return low;
}

export async function getTokenBalance(token, holder, rpc) {
  const data =
    "0x70a08231" +
    holder.toLowerCase().replace("0x", "").padStart(64, "0");

  const res = await axios.post(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to: token, data }, "latest"],
  });

  return BigInt(res.data.result);
}
