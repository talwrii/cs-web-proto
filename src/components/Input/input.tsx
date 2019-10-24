import React, { useState } from "react";

import classes from "./input.module.css";
import { writePv } from "../../hooks/useCs";
import { VType } from "../../vtypes/vtypes";
import { vtypeToString, stringToVtype } from "../../vtypes/utils";
import { PVWidget, PVWidgetInterface } from "../Widget/widget";

export interface InputProps {
  pvName: string;
  value: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  style?: object;
}

export const InputComponent: React.FC<InputProps> = (
  props: InputProps
): JSX.Element => (
  <input
    type="text"
    value={props.value}
    onKeyDown={props.onKeyDown}
    onChange={props.onChange}
    onBlur={props.onBlur}
    onClick={props.onClick}
    className={`Input ${classes.Input}`}
    style={props.style}
  />
);

interface SmartInputProps {
  pvName: string;
  value?: VType;
  style?: object;
}

export const SmartInputComponent: React.FC<SmartInputProps> = (
  props: SmartInputProps
): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      writePv(props.pvName, stringToVtype(event.currentTarget.value));
      setInputValue("");
      setEditing(false);
    }
  }
  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(event.currentTarget.value);
  }
  function onClick(event: React.MouseEvent<HTMLInputElement>): void {
    /* When focus gained allow editing. */
    if (!editing) {
      setInputValue("");
      setEditing(true);
    }
  }
  function onBlur(event: React.ChangeEvent<HTMLInputElement>): void {
    setEditing(false);
    /* When focus lost show PV value. */
    setInputValue(vtypeToString(props.value));
  }

  if (!editing && inputValue !== vtypeToString(props.value)) {
    setInputValue(vtypeToString(props.value));
  }

  return (
    <InputComponent
      pvName={props.pvName}
      value={inputValue}
      onKeyDown={onKeyDown}
      onChange={onChange}
      onBlur={onBlur}
      onClick={onClick}
      style={props.style}
    />
  );
};

interface InputWidgetProps {
  precision?: number;
}

export const Input = (
  props: InputWidgetProps & PVWidgetInterface
): JSX.Element => <PVWidget baseWidget={SmartInputComponent} {...props} />;
