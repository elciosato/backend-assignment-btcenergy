import { SchemaComposer } from "graphql-compose";
import {
  transactionsEnergyByBlockResolver,
  totalEnergyByWalletResolver,
} from "./resolver";

const schemaComposer = new SchemaComposer();

schemaComposer.Query.addFields({
  hello: {
    type: () => "String!",
    resolve: () => "Hi there, good luck with the assignment!",
  },
  transactionsEnergyByBlock: transactionsEnergyByBlockResolver,
  totalEnergyByWallet: totalEnergyByWalletResolver,
});

export const schema = schemaComposer.buildSchema();
