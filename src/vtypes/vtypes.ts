import { Alarm, AlarmProvider, ALARM_NONE } from "./alarm";
import { Display, DISPLAY_NONE } from "./display";
import { Time, timeNow, TimeProvider } from "./time";

export abstract class VType {
  public abstract getValue(): any;
}

export abstract class Scalar implements AlarmProvider, TimeProvider {
  public abstract getValue(): any;
  public abstract getAlarm(): Alarm;
  public abstract getTime(): Time;
}

export abstract class VNumber extends Scalar {
  public abstract getValue(): number;
}

export abstract class VDouble extends VNumber {
  public abstract getValue(): number;
  public abstract getAlarm(): Alarm;
  public abstract getTime(): Time;
  public abstract getDisplay(): Display;
}

class IVDouble extends VDouble {
  private value: number;
  private alarm: Alarm;
  private time: Time;
  private display: Display;
  public constructor(
    value: number,
    alarm: Alarm,
    time: Time,
    display: Display
  ) {
    super();
    this.value = value;
    this.alarm = alarm;
    this.time = time;
    this.display = display;
  }
  public getValue(): number {
    return this.value;
  }
  public getAlarm(): Alarm {
    return this.alarm;
  }
  public getTime(): Time {
    return this.time;
  }
  public getDisplay(): Display {
    return this.display;
  }
}

export const vdoubleOf = (
  double: number,
  alarm = ALARM_NONE,
  time = timeNow(),
  display = DISPLAY_NONE
): VDouble => new IVDouble(double, alarm, time, display);

export abstract class VString extends Scalar {
  public abstract getValue(): string;
}

class IVString extends VString {
  private value: string;
  private alarm: Alarm;
  private time: Time;

  public constructor(value: string, alarm: Alarm, time: Time) {
    super();
    this.value = value;
    this.alarm = alarm;
    this.time = time;
  }

  public getValue(): string {
    return this.value;
  }

  public getAlarm(): Alarm {
    return this.alarm;
  }
  public getTime(): Time {
    return this.time;
  }
}

export const vstringOf = (
  value: string,
  alarm = ALARM_NONE,
  time = timeNow()
): VString => new IVString(value, alarm, time);

abstract class EnumDisplay {
  public abstract getChoices(): string[];
}

class IEnumDisplay extends EnumDisplay {
  private choices: string[];

  public constructor(choices: string[]) {
    super();
    this.choices = choices;
  }

  public getChoices(): string[] {
    return this.choices;
  }
}

export abstract class VEnum extends Scalar {
  public abstract getValue(): string;
  public abstract getIndex(): number;
  public abstract getDisplay(): EnumDisplay;
  public abstract getChoices(): string[];
}

class IVEnum extends VEnum {
  private index: number;
  private alarm: Alarm;
  private time: Time;
  private display: EnumDisplay;

  public constructor(
    index: number,
    display: EnumDisplay,
    alarm: Alarm,
    time: Time
  ) {
    super();
    this.index = index;
    this.alarm = alarm;
    this.time = time;
    this.display = display;
  }

  public getValue(): string {
    return this.display.getChoices()[this.index];
  }
  public getIndex(): number {
    return this.index;
  }
  public getDisplay(): EnumDisplay {
    return this.display;
  }
  public getChoices(): string[] {
    return this.getDisplay().getChoices();
  }
  public getAlarm(): Alarm {
    return this.alarm;
  }
  public getTime(): Time {
    return this.time;
  }
}

export const venumOf = (
  index: number,
  choices: string[],
  alarm: Alarm,
  time: Time
): VEnum => new IVEnum(index, new IEnumDisplay(choices), alarm, time);
