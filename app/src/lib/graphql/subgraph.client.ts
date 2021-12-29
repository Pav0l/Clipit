import { GraphQLClient } from "graphql-request";
import { subgraphUrl } from "../constants";
import { GET_TOKEN_QUERY } from "./clipit";
import { Clip } from "./types";



export async function getClips() {
  const client = new GraphQLClient(subgraphUrl);

  const resp = await client.request<Clip>(GET_TOKEN_QUERY);

  console.log('[LOG]:subgraph:clips', resp);
}