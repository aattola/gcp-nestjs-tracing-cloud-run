import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { logger } from './logging';
const tracerProvider = new NodeTracerProvider();

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
  resource: tracerProvider.resource,
  traceExporter: new TraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    // Export metrics every 10 seconds. 5 seconds is the smallest sample period allowed by
    // Cloud Monitoring.
    exportIntervalMillis: 5_000,
    exporter: new MetricExporter(),
  }),
});

sdk.start();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  await app.listen(parseInt(process.env.PORT!, 10) || 3000);
}
bootstrap();
