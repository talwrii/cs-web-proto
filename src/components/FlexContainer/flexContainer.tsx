import React, { ReactNode } from "react";

import classes from "./flexContainer.module.css";
import { macroWrapper } from "../MacroWrapper/macroWrapper";
import { MacroMap } from "../../redux/csState";
import { Widget, WidgetInterface } from "../Widget/widget";

interface FlexProps {
  children: ReactNode;
  flexFlow?: "rowWrap" | "column" | "row" | "columnWrap";
  style?: object;
}

export const FlexContainer = (props: FlexProps): JSX.Element => {
  let classNames = [classes.FlexContainer];
  let { flexFlow = null } = props;
  if (flexFlow !== null) {
    classNames.push(classes[flexFlow]);
  }
  return (
    <div className={classNames.join(" ")} style={props.style}>
      {props.children}
    </div>
  );
};

interface MacroFlexProps extends FlexProps {
  macroMap: MacroMap;
}
const MacroFlexComponent: React.FC<MacroFlexProps> = macroWrapper(
  FlexContainer
);

export const FlexContainerWidget = (props: WidgetInterface): JSX.Element => (
  <Widget baseWidget={FlexContainer} {...props} />
);
