import { schemaComposer } from "graphql-compose";
import {
  BlockTC,
  RawBlockResponse,
  RawWalletResponse,
  WalletTC,
} from "./types";
import { blockchainApi } from "./blockchainApi";

const ENERGY_COST = 4.56;

const transactionsEnergyByBlockResolver = schemaComposer.createResolver({
  name: "transactionsEnergyByBlock",
  type: BlockTC,
  args: {
    blockHash: "ID!",
  },
  resolve: async ({ source, args, context, info }) => {
    const { blockHash } = args;
    const { data, status } = await blockchainApi.get<RawBlockResponse>(
      `/rawblock/${blockHash}`
    );

    const transactions = data.tx.map((t) => {
      return {
        transactionHash: t.hash,
        energyConsumption: Number(t.size) * ENERGY_COST,
        size: t.size,
      };
    });
    const block = {
      blockHash: data.hash,
      energyConsumption: Number(data.size) * ENERGY_COST,
      size: data.size,
      transactions,
    };

    return block;
  },
});

const totalEnergyByWalletResolver = schemaComposer.createResolver({
  name: "totalEnergyByWallet",
  type: WalletTC,
  args: {
    walletAddress: "ID!",
  },
  resolve: async ({ source, args, context, info }) => {
    const { walletAddress } = args;
    console.log(walletAddress);
    const { data, status } = await blockchainApi.get<RawWalletResponse>(
      `/rawaddr/${walletAddress}`
    );

    let size = 0;
    data.txs.forEach((t) => {
      size = size + Number(t.size);
    });
    const wallet = {
      walletAddress: data.address,
      energyConsumption: size * ENERGY_COST,
      size,
    };

    return wallet;
  },
});

export { transactionsEnergyByBlockResolver, totalEnergyByWalletResolver };
