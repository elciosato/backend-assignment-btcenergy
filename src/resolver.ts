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
import { getRedisClient } from "./get-redis-client";
import type { RedisClientType } from "redis";

const ENERGY_COST = 4.56;

let redisClient: RedisClientType;

const transactionsEnergyByBlockResolver = schemaComposer.createResolver({
  name: "transactionsEnergyByBlock",
  type: BlockTC,
  args: {
    blockHash: "ID!",
  },
  resolve: async ({ source, args, context, info }) => {
    const { blockHash } = args;
    const redisKey = `tranByBlock-${blockHash}`;
    let results;
    try {
      redisClient = await getRedisClient(redisClient);
      // Try to retrieve information in Redis cache
      let cachedResult = await redisClient.get(redisKey);
      if (cachedResult) {
        results = JSON.parse(cachedResult);
      } else {
        const { data } = await blockchainApi.get<RawBlockResponse>(
          `/rawblock/${blockHash}`
        );

        const transactions = data.tx.map((t) => {
          return {
            transactionHash: t.hash,
            energyConsumption: Number(t.size) * ENERGY_COST,
            size: t.size,
          };
        });
        results = {
          blockHash: data.hash,
          energyConsumption: Number(data.size) * ENERGY_COST,
          size: data.size,
          transactions,
        };
        await redisClient.set(redisKey, JSON.stringify(results), {
          EX: 60 * 60 * 24 * 7, // 7 days
        });
      }

      return results;
    } catch (err) {
      console.error(err);
      throw err;
    }
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
    try {
      redisClient = await getRedisClient(redisClient);

      // For loop per day
      for (let nDay = 0; nDay < numOfDays; nDay++) {
        // Day subtraction
        const currentDay = today.subtract(nDay, "day");

        const redisKeyBlocks = `energyByDays-${currentDay.valueOf()}`;
        let resultsBlocks;

        const cachedResultBlocks = await redisClient.get(redisKeyBlocks);

        if (cachedResultBlocks) {
          resultsBlocks = JSON.parse(cachedResultBlocks);
        } else {
          // Blockchain API per day - return blockHash per day without size information
          const { data } = await blockchainApi.get<[RawBlockResponse]>(
            `/blocks/${currentDay.valueOf()}?format=json`
          );
          resultsBlocks = data.map((block) => block.hash);
          await redisClient.set(redisKeyBlocks, JSON.stringify(resultsBlocks), {
            EX: 60 * 60 * 24 * 7, // 7 days
          });
        }

        // For loop per block - retrieve consumption per block
        let size = 0;
        for (let hash of resultsBlocks) {
          const redisKeySize = `energyByDays-${hash}`;
          let resultSize;

          const cachedResultSize = await redisClient.get(redisKeySize);

          if (cachedResultSize) {
            resultSize = JSON.parse(cachedResultSize);
          } else {
            // Blockchain API single block - return informations per block
            const { data } = await blockchainApi.get<RawBlockResponse>(
              `/rawblock/${hash}`
            );
            resultSize = data.size;
            await redisClient.set(redisKeySize, JSON.stringify(resultSize), {
              EX: 60 * 60 * 24 * 7, // 7 days
            });
          }
          size = size + Number(resultSize);
        }

        energyPerDay.push({
          date: currentDay.format("YYYY-MM-DD"),
          energyConsumption: size * ENERGY_COST,
        });
      }
      return energyPerDay;
    } catch (err) {
      console.error(err);
      throw err;
    }
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

    try {
      //  Get Redis Client connection
      redisClient = await getRedisClient(redisClient);
      // Prefix redisKey
      const redisKey = `energyByWallet-${walletAddress}`;
      let results;

      // Try to get cached information
      const cachedResult = await redisClient.get(redisKey);

      if (cachedResult) {
        // Return cached information
        results = JSON.parse(cachedResult);
      } else {
        // Information is not in the cache.
        // Retrieve information from the API
        const { data } = await blockchainApi.get<RawWalletResponse>(
          `/rawaddr/${walletAddress}`
        );

        let size = 0;
        data.txs.forEach((t) => {
          size = size + Number(t.size);
        });

        results = {
          walletAddress: data.address,
          energyConsumption: size * ENERGY_COST,
          size,
        };
        // Save the information in the cache
        await redisClient.set(redisKey, JSON.stringify(results), {
          EX: 60 * 30, // 30 min
          NX: true,
        });
      }
      return results;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
});

export {
  transactionsEnergyByBlockResolver,
  energyByNumOfDaysResolver,
  totalEnergyByWalletResolver,
};
