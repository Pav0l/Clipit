/* eslint-disable @typescript-eslint/no-explicit-any */

interface GenericLogger {
  log(message?: any, ...optionalParams: any[]): void;
}

export class Logger {
  constructor(private customLogger?: GenericLogger) {}

  log = (msg: any, ...optionalParams: any[]) => {
    this.customLogger?.log(msg, ...optionalParams);
    console.log(msg, ...optionalParams);
  };
}
