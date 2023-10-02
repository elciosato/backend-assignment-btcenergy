import { schemaComposer } from "graphql-compose";

const TransactionTC = schemaComposer.createObjectTC({
  name: "Transaction",
  fields: {
    transactionHash: "ID!",
    energyConsumption: "Float!",
    size: "Int!",
  },
});

const BlockTC = schemaComposer.createObjectTC({
  name: "Block",
  fields: {
    blockHash: "ID!",
    energyConsumption: "Float!",
    size: "Int!",
    transactions: {
      type: [TransactionTC]!,
    },
  },
});

const WalletTC = schemaComposer.createObjectTC({
  name: "Wallet",
  fields: {
    walletAddress: "ID",
    energyConsumption: "Float",
  },
});

const DayConsumptionTC = schemaComposer.createObjectTC({
  name: "DayConsumption",
  fields: {
    date: "String",
    energyConsumption: "Float",
  },
});

type TransactionResponse = {
  hash: string;
  size: string;
};

type RawBlockResponse = {
  hash: string;
  size: number;
  tx: [TransactionResponse];
};

type RawWalletResponse = {
  address: string;
  txs: [TransactionResponse];
};

export {
  TransactionTC,
  BlockTC,
  WalletTC,
  DayConsumptionTC,
  RawBlockResponse,
  RawWalletResponse,
};
