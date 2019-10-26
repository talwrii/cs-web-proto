// Front page of application

import React from "react";

import {
  ConnectedReadback,
  ConnectedStandaloneReadback
} from "../components/Readback/readback";
import {
  ConnectedInput,
  ConnectedStandaloneInput
} from "../components/Input/input";
import { Label } from "../components/Label/label";
import { ConnectedMenuButton } from "../components/MenuButton/menuButton";

export const FrontPage = (): JSX.Element => (
  <div id="Central Column" style={{ width: "80%", margin: "auto" }}>
    <div>
      <ConnectedReadback pvName={"TMC43-TS-IOC-01:AI"} />
      Local pv: <ConnectedReadback pvName={"loc://pv1"} />
      <ConnectedReadback pvName={"loc://pv2"} />
      <ConnectedReadback pvName={"sim://sine"} precision={3} />
      <ConnectedReadback pvName={"sim://sine#other"} precision={3} />
      <ConnectedReadback pvName={"loc://pv1(1)"} precision={3} />
      <ConnectedReadback pvName={"sim://disconnector"} precision={3} />
    </div>
    <div>
      <ConnectedStandaloneInput pvName={"loc://pv1"} />
      <ConnectedStandaloneInput pvName={"loc://pv2"} />
      <ConnectedStandaloneInput pvName={"sim://sine"} />
      <ConnectedStandaloneInput pvName={"sim://sine"} />
    </div>
    <div>
      <h3>PV with Metadata</h3>
      <div
        style={{
          position: "relative",
          display: "block",
          height: "30px",
          margin: "15px"
        }}
      >
        <div
          style={{
            display: "inline-block",
            position: "absolute",
            top: "0%",
            right: "50%",
            height: "100%",
            width: "50%",
            margin: "auto"
          }}
        >
          <ConnectedInput pvName={"sim://limit#metapv1"} />
        </div>
        <div
          style={{
            display: "inline-block",
            position: "absolute",
            top: "0%",
            left: "50%",
            height: "100%",
            width: "50%",
            margin: "auto"
          }}
        >
          <ConnectedReadback pvName={"sim://limit#metapv1"} />
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: "2em",
          margin: "15px auto"
        }}
      >
        <ConnectedStandaloneReadback
          pvName={"sim://limit#metapv1"}
          precision={2}
        />
      </div>
      <div
        style={{
          position: "relative",
          display: "block",
          margin: "15px auto"
        }}
      >
        <Label text="Simulated Enum" />
        <ConnectedMenuButton pvName={"sim://enum"} />
        <ConnectedInput pvName={"sim://enum"} />
        <ConnectedStandaloneReadback pvName={"sim://enum"} precision={2} />
      </div>
      <div
        style={{
          position: "relative",
          display: "block",
          margin: "15px auto"
        }}>

        <Label text="Local Enum - [une, deux, trois]" />
        Initializer: <ConnectedMenuButton pvName={"loc://enum1<VEnum>(2, \"une\", \"deux\", \"trois\")"} />
        <br />
        Duplicate initializer: <ConnectedMenuButton pvName={"loc://enum1<VEnum>(2, \"bad\", \"worse\", \"terrible\")"} />
        <br />
        Using initialized value<ConnectedReadback pvName={"loc://enum1"} />
        <br />
        Bad enum protocol: <ConnectedMenuButton pvName={"enum://test"} />


        <Label text="Initalized pvnames" />

        <ConnectedReadback pvName={"loc://one(1.0)"} />

      </div>
    </div>

  </div >
);
