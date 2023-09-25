import { ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { TextEncoder } from 'util';

export class MyLogger extends ConsoleLogger {
  wLogger = winston.createLogger({
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        dirname: 'files/log',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        createSymlink: true,
      }),
    ],
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf((info) => {
        return JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message });
      }),
    ),
    exitOnError: false,
  });

  /**
   *
   * @param message
   * @param {"error" | "warn" | "info" | "verbose" | "debug"} level
   * @param {string} trace
   * @return {Promise<void>}
   */
  async log(message: any, level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' = 'info', trace?: string) {
    if (message !== undefined) {
      let size = 0;

      // we only log if not in dev
      if (process.env.NODE_ENV === 'prod') {
        this.wLogger.log({ level, message });
      }

      try {
        size = this.getSizeInBytes(message);
      } catch (e) {}
      if (size <= 5000) {
        super.log(message);
      }
    }
  }

  async debug(message: any, level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' = 'info') {
    if (message !== undefined && process.env.DEBUG == 'true') {
      let size = 0;

      // we only log if not in dev
      if (process.env.NODE_ENV === 'prod') {
        this.wLogger.info({ level, message });
      }

      try {
        size = this.getSizeInBytes(message);
      } catch (e) {}
      if (size <= 5000) {
        super.debug(message);
      }
    }
  }

  /**
   * If the given object is a string then use it else make it into an object. Then returns the length of the new encoded String.
   * @param obj
   * @returns {number}
   */
  getSizeInBytes(obj): number {
    let str;
    if (typeof obj === 'string') {
      // If obj is a string, then use it
      str = obj;
    } else {
      // Else, make obj into a string
      str = JSON.stringify(obj);
    }
    // Get the length of the Uint8Array
    return new TextEncoder().encode(str).length;
  }
}
