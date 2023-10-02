import { schemaComposer } from "graphql-compose";
import { BlockTC } from "./types";
import { blockchainApi } from "./blockchainApi";

const ENERGY_COST = 4.56;

type transactionResponse = {
  hash: string;
  size: string;
};

type RawBlockResponse = {
  hash: string;
  size: number;
  tx: [transactionResponse];
};

const transactionsEnergyByBlockResolver = schemaComposer.createResolver({
  name: "transactionsEnergyByBlock",
  type: BlockTC,
  args: {
    blockHash: "String!",
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

  // hello2: {
  //   type: "[Block]",
  //   resolve: async () => {
  //     const result = await axios.get(
  //       "https://blockchain.info/blocks/1695247200000?format=json"
  //     );

  //     const blocks = result.data.map((b) => {
  //       return { hash: b.hash };
  //     });
  //     return blocks;
  //   },
  // },
});

export { transactionsEnergyByBlockResolver };
