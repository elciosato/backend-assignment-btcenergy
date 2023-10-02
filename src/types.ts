import { schemaComposer } from "graphql-compose";

const TransactionTC = schemaComposer.createObjectTC({
  name: "Transaction",
  fields: {
    transactionHash: "String",
    energyConsumption: "Float",
    size: "Int",
  },
});

const BlockTC = schemaComposer.createObjectTC({
  name: "Block",
  fields: {
    blockHash: "String",
    energyConsumption: "Float",
    size: "Int",
    transactions: {
      type: [TransactionTC],
    },
  },
});

export { TransactionTC, BlockTC };
