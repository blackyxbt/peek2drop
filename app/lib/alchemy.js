import axios from "axios";

export const MAX_COUNT = "0x3e8";

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

export async function getStartBlock(distributor, token, rpc) {
  const res = await axios.post(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromAddress: distributor,
        contractAddresses: [token],
        category: ["erc20"],
        fromBlock: "0x0",
        toBlock: "latest",
        maxCount: "0x1",
        order: "asc",
      },
    ],
  });

  const transfers = res.data.result.transfers;

  if (!transfers || transfers.length === 0) {
    return null;
  }

  return BigInt(transfers[0].blockNum);
}

export async function getTokenDecimals(token, rpc) {
  const res = await axios.post(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [
      {
        to: token,
        data: "0x313ce567", // decimals()
      },
      "latest",
    ],
  });

  return BigInt(res.data.result);
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

