import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import {
  ConnectedReadback,
  ConnectedCopyReadback
} from "./components/Readback/readback";
import { ConnectedInput } from "./components/Input/input";
import { ConnectedProgressBar } from "./components/ProgressBar/ProgressBar";
import { ConnectedSlideControl } from "./components/SlideControl/SlideControl";
import { ConnectedCopyWrapper } from "./components/CopyWrapper/CopyWrapper";
import { AlarmBorder } from "./components/AlarmBorder/AlarmBorder";
import { getStore, initialiseStore } from "./redux/store";
import { SimulatorPlugin } from "./connection/sim";

const App: React.FC = (): JSX.Element => {
  const plugin = new SimulatorPlugin();
  initialiseStore(plugin);
  let store = getStore();
  return (
    <Provider store={store}>
      <div className="App">
        <h1>CS Web Proto</h1>
        <div style={{ display: "block" }}>
          <ConnectedReadback pvName={"TMC43-TS-IOC-01:AI"} />
          <ConnectedReadback pvName={"loc://pv1"} />
          <ConnectedReadback pvName={"loc://pv2"} />
          <ConnectedReadback pvName={"sim://sine"} precision={3} />
          <ConnectedReadback pvName={"sim://disconnector"} precision={3} />
        </div>
        <div style={{ display: "block" }}>
          <ConnectedInput pvName={"loc://pv1"} />
          <ConnectedInput pvName={"loc://pv2"} />
          <ConnectedInput pvName={"sim://sine"} />
          <ConnectedInput pvName={"sim://sine"} />
        </div>
        <div>
          <h3>PV with Metadata</h3>
          <div style={{ display: "flex" }}>
            <div style={{ flexGrow: 1 }}>
              <ConnectedInput pvName={"meta://metapv1"} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <ConnectedCopyReadback pvName={"meta://metapv1"} />
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: "500px",
            left: "10%",
            height: "20%",
            width: "50%"
          }}
        >
          <ConnectedSlideControl pvName="loc://pv1" min={0} max={100} />
        </div>
        <div
          style={{
            position: "absolute",
            left: "10%",
            height: "20%",
            width: "50%"
          }}
        >
          <ConnectedProgressBar
            pvName={"sim://sine"}
            min={-1}
            max={1}
            precision={2}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "70%",
            height: "20%",
            width: "20%"
          }}
        >
          <ConnectedCopyWrapper pvName="meta://metapv1">
            This is a connected copy wrapper
          </ConnectedCopyWrapper>
        </div>
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: "70%",
            height: "20%",
            width: "20%"
          }}
        >
          <AlarmBorder alarm={{ severity: 2, status: 0, message: "" }}>
            <ConnectedProgressBar
              pvName={"sim://sine"}
              min={-1}
              max={1}
              precision={2}
            />
          </AlarmBorder>
        </div>
      </div>
    </Provider>
  );
};

export default App;
