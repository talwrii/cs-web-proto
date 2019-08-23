import { Connection } from "../connection/plugin";
import { PvResolver, ResolvedPv } from "../redux/pvResolver";
import { Store } from "redux";
import { CsState } from "../redux/csState";

import {
  CONNECTION_CHANGED,
  SUBSCRIBE,
  WRITE_PV,
  VALUE_CHANGED
} from "./actions";
import { getStore } from "./store";
import { NType } from "../ntypes";

export interface ConnectionState {
  isConnected: boolean;
}

function connectionChanged(pvName: string, value: ConnectionState): void {
  getStore().dispatch({
    type: CONNECTION_CHANGED,
    payload: { pvName: pvName, value: value }
  });
}

function valueChanged(
  pvName: string,
  value: NType,
  store?: Store<CsState, any>
): void {
  store = store || getStore();
  store.dispatch({
    type: VALUE_CHANGED,
    payload: { pvName: pvName, value: value }
  });
}

export class ConnectionMiddleware {
  private connection: Connection;
  private resolver: PvResolver;

  public constructor(connection: Connection, pvResolver: PvResolver) {
    this.connection = connection;
    this.resolver = pvResolver;
  }

  public mapMacro(
    store: Store<CsState, any>,
    macro: string,
    valueString: string
  ) {
    let changes = this.resolver.mapMacro(macro, valueString);
    for (let resolution of changes.newResolutions) {
      this.connection.subscribe(resolution.resolvedName);
    }

    // for (let _resolution of changes.removedResolutions) {
    //   // unsubscribe
    //   1;
    // }

    for (let resolution of changes.duplicateResolutions) {
      this.refreshPv(store, resolution);
    }
  }

  private refreshPv(store: Store<CsState, any>, resolution: ResolvedPv) {
    let csState: CsState = store.getState();
    let currentValue = csState.valueCache[resolution.resolvedName];
    if (currentValue !== undefined) {
      valueChanged(resolution.resolvedName, currentValue.value, store);
    }
  }

  /* Cheating with the types here. */
  // eslint doesn't deal with currying very well:
  // (x:any): any => (y:any): any => (z:any): any is perverse
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public updateStore = (store: Store<CsState, any>) => (next: any) => (
    action: any
  ) => {
    if (!this.connection.isConnected()) {
      this.connection.connect(connectionChanged, valueChanged);
    }
    switch (action.type) {
      case SUBSCRIBE: {
        let result = this.resolver.resolve(action.payload.pvName);
        for (let resolution of result.newResolutions) {
          this.connection.subscribe(resolution.resolvedName);
        }

        for (let resolution of result.duplicateResolutions) {
          this.refreshPv(store, resolution);
        }

        break;
      }
      case WRITE_PV: {
        this.connection.putPv(action.payload.pvName, action.payload.value);
        break;
      }
    }
    return next(action);
  };
}
