import axios from "axios";
import {
  CHAINS,
  MAX_COUNT,
  DECIMALS,
  getContractCreationBlock,
  getTokenBalance,
} from "../lib/alchemy";

export async function POST(req) {
  try {
    const { chain, tokenCA, distributorCA } = await req.json();

    if (!CHAINS[chain]) {
      return Response.json({ error: "Unsupported chain" }, { status: 400 });
    }

    const rpc = CHAINS[chain].rpc(process.env.ALCHEMY_KEY);

    const creationBlock = await getContractCreationBlock(distributorCA, rpc);
    const fromBlock =
      creationBlock > 5n ? creationBlock - 5n : creationBlock;

    let pageKey = null;
    const recipients = {};
    let tokensDistributed = 0n;

    do {
      const res = await axios.post(rpc, {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock: "0x" + fromBlock.toString(16),
            toBlock: "latest",
            fromAddress: distributorCA,
            contractAddresses: [tokenCA],
            category: ["erc20"],
            maxCount: MAX_COUNT,
            pageKey,
          },
        ],
      });

      const result = res.data.result;

      for (const tx of result.transfers) {
        if (!tx.to) continue;
        const amount = BigInt(tx.rawContract.value);
        tokensDistributed += amount;
        recipients[tx.to] = (recipients[tx.to] || 0n) + amount;
      }

      pageKey = result.pageKey;
    } while (pageKey);

    const remaining = await getTokenBalance(
      tokenCA,
      distributorCA,
      rpc
    );

    const total = tokensDistributed + remaining;

    const entries = Object.entries(recipients).sort((a, b) =>
        (a[1] < b[1] ? 1 : -1)).map(([address, amount]) =>
            ({address,amount: (amount / 10n ** DECIMALS).toString(),}));


    return Response.json({
      chain: CHAINS[chain].name,
      total: (total / 10n ** DECIMALS).toString(),
      claimed: (tokensDistributed / 10n ** DECIMALS).toString(),
      unclaimed: (remaining / 10n ** DECIMALS).toString(),
      recipients: entries,
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}