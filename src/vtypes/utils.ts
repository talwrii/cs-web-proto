import { VNumber, VType, vdouble, VEnum } from "./vtypes";
import { VString, vstring } from "./string";
import { ALARM_NONE } from "./alarm";
import { timeNow } from "./time";
import { DISPLAY_NONE } from "./display";

export const vtypeToString = (vtype?: VType, precision?: number): string => {
  if (vtype instanceof VNumber) {
    if (precision) {
      return vtype.getValue().toFixed(precision);
    } else {
      return vtype.getValue().toString();
    }
  }
  if (vtype) {
    if (vtype instanceof VString || vtype instanceof VEnum) {
      return vtype.getValue();
    } else {
      return vtype.toString();
    }
  }
  return "";
};

export function vtypeToNumber(vtype: VType): number {
  let value = vtype.getValue();
  let numericValue;
  if (typeof value === "number") {
    numericValue = value;
  } else if (typeof value === "string") {
    numericValue = parseFloat(value);
  } else {
    numericValue = 0;
  }
  return numericValue;
}

export function vtypeOrUndefinedToNumber(vtype?: VType): number {
  if (vtype) {
    return vtypeToNumber(vtype);
  } else {
    return 0;
  }
}

export const stringToVtype = (
  value: string,
  alarm = ALARM_NONE,
  time = timeNow(),
  display = DISPLAY_NONE
): VType => {
  try {
    if (isNaN(parseFloat(value))) {
      throw new Error("Not a number");
    }
    let numberValue = parseFloat(value);
    return vdouble(numberValue, alarm, time, display);
  } catch (error) {
    return vstring(value, alarm, time);
  }
};

export const valueToVtype = (
  value: any,
  alarm = ALARM_NONE,
  time = timeNow(),
  display = DISPLAY_NONE
): VType => {
  if (typeof value === "string") {
    return vstring(value, alarm, time);
  } else if (typeof value === "number") {
    return vdouble(value, alarm, time, display);
  }
  return vdouble(0, alarm, time, display);
};
