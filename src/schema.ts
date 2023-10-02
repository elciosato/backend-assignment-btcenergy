import { SchemaComposer } from "graphql-compose";
import { transactionsEnergyByBlockResolver } from "./resolver";

const schemaComposer = new SchemaComposer();

schemaComposer.Query.addFields({
  hello: {
    type: () => "String!",
    resolve: () => "Hi there, good luck with the assignment!",
  },
  transactionsEnergyByBlock: transactionsEnergyByBlockResolver,
});

export const schema = schemaComposer.buildSchema();
