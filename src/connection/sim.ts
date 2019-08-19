import { ConnectionPlugin } from "./plugin";
import { NType } from "../cs";
import { ValueCache } from "../redux/store";

export class SimulatorPlugin implements ConnectionPlugin {
  private url: string;
  private value: number;
  private localPvs: ValueCache;
  private onUpdate: (pvName: string, value: any) => void;

  public constructor(
    websocketUrl: string,
    onUpdate: (pvName: string, value: any) => void
  ) {
    this.url = websocketUrl;
    this.value = 0;
    this.localPvs = {};
    this.onUpdate = onUpdate;
    this.subscribe = this.subscribe.bind(this);
    this.putPv = this.putPv.bind(this);
    /* Set up the sine PV. */
    setInterval(
      (): void => this.onUpdate("sim://sine", this.getValue("sim://sine")),
      2000
    );
  }

  public subscribe(pvName: string): void {
    console.log(`creating connection to ${pvName}`); //eslint-disable-line no-console
    if (pvName.startsWith("loc://")) {
      this.localPvs[pvName] = { type: "NTScalarDouble", value: 0 };
      this.onUpdate(pvName, { type: "NTScalarDouble", value: 0 });
    }
  }

  public putPv(pvName: string, value: NType): void {
    if (pvName.startsWith("loc://")) {
      this.localPvs[pvName] = value;
      this.onUpdate(pvName, value);
    }
  }

  public getValue(pvName: string): NType {
    if (pvName.startsWith("loc://")) {
      return this.localPvs[pvName];
    } else if (pvName === "sim://sine") {
      const val = Math.sin(
        new Date().getSeconds() + new Date().getMilliseconds() * 0.001
      );
      return { type: "NTScalarDouble", value: val };
    } else if (pvName === "sim://random") {
      return { type: "NTScalarDouble", value: Math.random() };
    } else {
      return { type: "NTScalarDouble", value: 0 };
    }
  }
}
