import { SchemaComposer } from "graphql-compose";
import {
  transactionsEnergyByBlockResolver,
  totalEnergyByWalletResolver,
  energyByNumOfDaysResolver,
} from "./resolver";

const schemaComposer = new SchemaComposer();

schemaComposer.Query.addFields({
  hello: {
    type: () => "String!",
    resolve: () => "Hi there, good luck with the assignment!",
  },
  transactionsEnergyByBlock: transactionsEnergyByBlockResolver,
  totalEnergyByWallet: totalEnergyByWalletResolver,
  energyByNumOfDays: energyByNumOfDaysResolver,
});

export const schema = schemaComposer.buildSchema();
