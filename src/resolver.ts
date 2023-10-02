import { schemaComposer } from "graphql-compose";
import dayjs from "dayjs";
import {
  BlockTC,
  DayConsumptionTC,
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

const energyByNumOfDaysResolver = schemaComposer.createResolver({
  name: "energyByNumOfDays",
  type: [DayConsumptionTC],
  args: {
    numOfDays: "Int!",
  },
  resolve: async ({ source, args, context, info }) => {
    const numOfDays = Number(args.numOfDays);
    // Date without time
    const today = dayjs().startOf("day");

    // Result
    let energyPerDay = [];

    // For loop per day
    for (let nDay = 0; nDay < numOfDays; nDay++) {
      // Day subtraction
      const currentDay = today.subtract(nDay, "day");

      // Blockchain API per day
      const { data: blocks, status: blocksStatus } = await blockchainApi.get<
        [RawBlockResponse]
      >(`/blocks/${currentDay.valueOf()}?format=json`);

      // For loop per block - retrieve consumption per block
      let size = 0;
      for (let block of blocks) {
        const { data } = await blockchainApi.get<RawBlockResponse>(
          `/rawblock/${block.hash}`
        );
        size = size + Number(data.size);
      }

      energyPerDay.push({
        date: currentDay.format("YYYY-MM-DD"),
        energyConsumption: size * ENERGY_COST,
      });
    }
    return energyPerDay;
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

export {
  transactionsEnergyByBlockResolver,
  energyByNumOfDaysResolver,
  totalEnergyByWalletResolver,
};
