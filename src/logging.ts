import { LoggingWinston } from '@google-cloud/logging-winston';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const loggingWinston = new LoggingWinston({
  redirectToStdout: true,
  useMessageField: true,
});

const Transport = loggingWinston;
//   process.env.NODE_ENV === 'production'
//     ? loggingWinston
//     : new winston.transports.Console({
//         format: winston.format.simple(),
//       });

// Create a Winston logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = WinstonModule.createLogger({
  transports: [Transport],
});

export { logger };
