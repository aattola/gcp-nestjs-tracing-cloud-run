import { LoggingWinston } from '@google-cloud/logging-winston';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { format } from 'winston';
import * as util from 'util';

const loggingWinston = new LoggingWinston({
  redirectToStdout: true,
  useMessageField: false,
});

function transform(info: any) {
  const args = info[Symbol.for('splat')];
  if (args) {
    info.message = util.format(info.message, ...args);
  }
  return info;
}

function utilFormatter() {
  return { transform };
}

const winstonLogger = winston.createLogger({
  level: 'info',
  transports: [
    process.env.GCLOUD
      ? loggingWinston
      : new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            format.timestamp({ format: 'HH:mm:ss.SSS' }),
            utilFormatter(),
            format.colorize(),
            format.printf(
              ({ level, message, label, timestamp }) =>
                `${timestamp} ${label || '-'} ${level}: ${message}`,
            ),
          ),
        }),
  ],
});
export const logger = WinstonModule.createLogger(winstonLogger);
