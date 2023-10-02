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

export { TransactionTC, BlockTC, WalletTC };
