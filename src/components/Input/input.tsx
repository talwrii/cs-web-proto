import React, { useState } from "react";
import { connectionWrapper } from "../ConnectionWrapper/connectionWrapper";
import { writePv } from "../../hooks/useCs";
import { NType, ntOrNullToString } from "../../ntypes";

import classes from "./input.module.css";

export interface InputProps {
  pvName: string;
  value: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  style?: object;
}

export const Input: React.FC<InputProps> = (props: InputProps): JSX.Element => (
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

interface ConnectedInputProps {
  pvName: string;
  style?: object;
}

interface SmartInputProps {
  pvName: string;
  value?: NType;
  style?: object;
}

export const SmartInput: React.FC<SmartInputProps> = (
  props: SmartInputProps
): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      writePv(props.pvName, {
        type: "NTScalar",
        value: event.currentTarget.value
      });
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
    setInputValue(ntOrNullToString(props.value));
  }

  if (!editing && inputValue !== ntOrNullToString(props.value)) {
    setInputValue(ntOrNullToString(props.value));
  }

  return (
    <Input
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

export const ConnectedInput: React.FC<ConnectedInputProps> = connectionWrapper(
  SmartInput
);
