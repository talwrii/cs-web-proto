import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import gql from "graphql-tag";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { NType } from "../cs";
import { Connection, ConnectionCallback } from "./plugin";

function createLink(socket: string): ApolloLink {
  const link: ApolloLink = ApolloLink.split(
    ({ query }): boolean => {
      // https://github.com/apollographql/apollo-client/issues/3090
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    new WebSocketLink({
      uri: `ws://${socket}/subscriptions`,
      options: {
        reconnect: true
      }
    }),
    new HttpLink({ uri: `http://${socket}/graphql` })
  );

  return link;
}

const cache = new InMemoryCache();

const PV_SUBSCRIPTION = gql`
  subscription sub1($pvName: String!) {
    subscribeFloatScalar(channel: $pvName) {
      value
    }
  }
`;

export class ConiqlPlugin implements Connection {
  private client: ApolloClient<NormalizedCacheObject>;
  private callback: (pvName: string, data: NType) => void;

  public constructor(socket: string) {
    const link = createLink(socket);
    this.client = new ApolloClient({ link, cache });
    this.callback = (_p, _v): void => {};
  }

  public connect(callback: ConnectionCallback): void {
    this.callback = callback;
  }

  public isConnected(): boolean {
    return this.client != null;
  }

  public subscribe(pvName1: string): void {
    this.client
      .subscribe({
        query: PV_SUBSCRIPTION,
        variables: { pvName: pvName1 }
      })
      .subscribe({
        next: (data): void => {
          console.log("data", data); //eslint-disable-line no-console
          this.callback(pvName1, data.data.subscribeFloatScalar);
        },
        error: (err): void => {
          console.error("err", err); //eslint-disable-line no-console
        }
      });
  }

  public putPv(pvName: string, value: NType): void {
    // noop
  }

  public getValue(pvName: string): NType {
    return { type: "NTScalarDouble", value: "" };
  }
}
