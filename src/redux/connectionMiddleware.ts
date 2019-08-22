import { Connection } from "../connection/plugin";
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

function valueChanged(pvName: string, value: NType): void {
  getStore().dispatch({
    type: VALUE_CHANGED,
    payload: { pvName: pvName, value: value }
  });
}

class ResolvedPv {
  public resolvedName: string;
  public constructor(resolvedName: string) {
    this.resolvedName = resolvedName;
  }
}

export class NoMapping extends Error {
  mapping: string;
  constructor(public mapping: string) {
    super("No mapping for " + mapping);
    this.mapping = mapping;
    this.name = "UnexpectedInput";
  }
}

function interpolate(str: string, substitutions: { [string]: string }) {
  let groups = [];

  var result;
  var regexp = /\${(.*?)}/g;
  while ((result = regexp.exec(str))) {
    groups.push(result[1]);
  }
  let requiredMappings = groups;
  let missingsMappings = requiredMappings.filter(
    x => substitutions[x] === undefined
  );

  if (missingsMappings.length != 0) {
    throw new NoMapping(missingsMappings[0]);
  }

  return str.replace(/\${(.*?)}/g, (x, g) => substitutions[g]);
}

export class PvResolver {
  substitutions: { [string]: string };
  resolutions: { [unmapped: string]: ResolvedPv };

  public constructor() {
    this.substitutions = {};
    this.resolutions = {};
  }

  private hasResolution(pv: ResolvedPv) {
    const existingNames = Object.keys(this.resolutions).map(
      x => x.resolvedName
    );
    return existingNames.indexOf(pv.resolvedName) != -1;
  }

  public resolve(
    name: string
  ): { pv: ResolvedPv; newResolutions: [ResolvedPv] } {
    const oldResolution = this.resolutions[name];
    const resolvedPv = new ResolvedPv(interpolate(name, this.substitutions));

    console.log("resolve");
    console.log(oldResolution);
    console.log(resolvedPv);

    var newResolutions;
    if (
      oldResolution == undefined ||
      oldResolution.resolvedName != resolvedPv.resolvedName
    ) {
      console.log("New resolutiosn");
      console.log(oldResolution);
      console.log(resolvedPv);
      newResolutions = [resolvedPv];
    } else {
      newResolutions = [];
    }

    this.resolutions[name] = resolvedPv;

    return {
      pv: resolvedPv,
      newResolutions: newResolutions
    };
  }

  public mapMacro(
    macro: string,
    valueString: string
  ): { newResolutions: ResolvedPv[]; removedResolutions: ResolvedPv[] } {
    /**
       This may remove and add resolutions if the mappings have changed.
     */
    this.substitutions[macro] = valueString;

    let newResolutions: ResolvedPv[] = [];
    let removedResolutions: ResolvedPv[] = [];
    let updates: { [unresolved: string]: ResolvedPv } = {};

    for (let unresolved in this.resolutions) {
      // potentially inefficient - we could pull out the mappings involved
      //   in each resolution and then only remap these. But this feels like
      //   a premature performance hack

      let oldResolution = this.resolutions[unresolved];
      let newResolution = new ResolvedPv(
        interpolate(unresolved, this.substitutions)
      );
      if (oldResolution.resolvedName != newResolution.resolvedName) {
        newResolutions.push(newResolution);
        removedResolutions.push(oldResolution);
        updates[unresolved] = newResolution;
      }

      for (let unresolved in updates) {
        this.resolutions[unresolved] = updates[unresolved];
      }
    }

    return {
      newResolutions: newResolutions,
      removedResolutions: removedResolutions
    };
  }
}

class ConnectionMiddleware {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  /* Cheating with the types here. */
  // eslint doesn't deal with currying very well:
  // (x:any): any => (y:any): any => (z:any): any is perverse
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public updateStore = (store: any) => (next: any) => (action: any) => {
    if (!this.connection.isConnected()) {
      this.connection.connect(connectionChanged, valueChanged);
    }
    switch (action.type) {
      case SUBSCRIBE: {
        this.connection.subscribe(action.payload.pvName);
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
