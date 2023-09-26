import { Controller, Get, Header, Headers, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { trace } from '@opentelemetry/api';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { logger } from './logging';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    const t = trace.getActiveSpan();
    console.log(t, 'trace');
    t?.addEvent('test event');
    t?.setAttribute('test attribute', 'test value');
    logger.log('Hei trace', {
      moi: 'ok',
      labels: {
        'test-label': 'test-value',
      },
      [LoggingWinston.LOGGING_TRACE_KEY]: t?.spanContext().traceId,
    });

    return this.appService.getHello();
  }

  @Get('/ttest')
  getTTest(@Headers('X-Cloud-Trace-Context') traceId?: string): string {
    const t = trace.getActiveSpan();

    this.logger.log({
      moi: 'ok',
      message: 'TRACEID: ' + traceId,
      labels: {
        'test-label': 'test-value',
      },
      [LoggingWinston.LOGGING_TRACE_KEY]: `projects/taikuri/traces/${t?.spanContext()
        .traceId}`,
    });

    return this.appService.getHello();
  }

  @Get('/error')
  getError(): string {
    throw new Error('This is an error');
  }

  @Get('/timeout')
  getTimeout(): string {
    setTimeout(() => {
      throw new Error('This is a timeout error');
    }, 1000);
    return 'This is a timeout';
  }

  @Get('/test')
  getTest(): string {
    this.logger.log('test logging');

    const hing = this.appService.getHello();
    this.logger.warn('test warning');

    return 'This is a test' + hing;
  }

  @Get('/test2')
  getTest2(): string {
    console.log('test2 loggi');
    return 'This is a test2';
  }
}
