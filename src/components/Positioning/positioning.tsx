import React from "react";
import { MacroMap } from "../../redux/csState";

// Interface to describe components by absolute position
export interface PositionDescription {
  // String which will be used as an index to a dictionary later
  type: string;
  // Absolute positions - allow strings for "%" or "px" etc
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  // All other component properties
  [x: string]: any;
  // Array of any children nodes - children are all at same level
  // with respect to positioning
  children?: PositionDescription[] | null;
}

export function objectToPosition(
  inputObjects: PositionDescription | null,
  componentDict: { [index: string]: any },
  macroMap: MacroMap
): JSX.Element | null {
  // If there is nothing here, return null
  if (inputObjects === null) {
    return null;
  } else {
    // Extract properties
    let {
      x,
      y,
      height,
      width,
      type,
      children = null,
      ...otherProps
    } = inputObjects;

    otherProps.macroMap = macroMap;

    // Create the main component
    let Component: React.FC = componentDict[type];

    // Create all children components - recursive
    let PositionedChildren = null;
    if (children) {
      PositionedChildren = children.map((child): JSX.Element | null =>
        objectToPosition(child, componentDict, macroMap)
      );
    } else {
      PositionedChildren = null;
    }

    // Return the node with children as children
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: width,
          height: height
        }}
      >
        <Component {...otherProps}>{PositionedChildren}</Component>
      </div>
    );
  }
}
