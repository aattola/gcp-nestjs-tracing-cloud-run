import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { logger } from './logging';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import {
  LOGGING_SPAN_KEY,
  LOGGING_TRACE_KEY,
} from '@google-cloud/logging-winston';

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
    new WinstonInstrumentation({
      enabled: true,
      logHook: (span, record) => {
        // remember to change project id if you copy this code
        record[LOGGING_TRACE_KEY] = `projects/taikuri/traces/${
          span.spanContext().traceId
        }`;
        record[LOGGING_SPAN_KEY] = `projects/taikuri/traces/${
          span.spanContext().spanId
        }`;
      },
    }),
  ],
  traceExporter: new TraceExporter(),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  await app.listen(parseInt(process.env.PORT!, 10) || 3000);
}
bootstrap();
