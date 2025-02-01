import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { QueryFailedError } from 'typeorm';
import { BaseHttpException } from './base-http-exception';
import { ErrorCodeEnum } from './error-code.enum';
import { MessageSource } from './errors';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private response = {
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: 'Something went wrong!',
  };

  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();
    const lang = 'en';

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const baseException = exception as BaseHttpException | any;
      const params = baseException.params;
      const messageKey =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

      // Localize message if available
      let localizedMessage =
        new MessageSource().getMessage(messageKey, lang, params) || messageKey;

      if (messageKey?.includes(' - ')) {
        localizedMessage = localizedMessage
          .split(' - ')
          .map((messagePart) =>
            ErrorCodeEnum[messagePart]
              ? new MessageSource().getMessage(messagePart, lang, params)
              : messagePart,
          )
          .join(' - ');
      }

      this.logger.setContext(
        `${HttpExceptionFilter.name}-${request.method} ${request.url}`,
      );
      this.logger.error(
        `Message: ${localizedMessage}`,
        `Path: ${request.url}`,
        `Method: ${request.method}`,
        `Body: ${JSON.stringify(request.body)}`,
        `User: ${request.user ? request.user.id : 'No user'}`,
      );

      this.response.code = statusCode;
      this.response.message = localizedMessage;

      return response.status(statusCode).json(this.response);
    }

    // Handle TypeORM QueryFailedError
    if (exception instanceof QueryFailedError) {
      this.response.code = HttpStatus.INTERNAL_SERVER_ERROR;
      this.response.message = exception.message;

      this.logger.error(
        `Message: ${exception.message}`,
        `Stack: ${exception.stack}`,
        `Query: ${exception.query}`,
      );

      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(this.response);
    }

    if (
      exception instanceof RangeError ||
      (exception as any).name === 'PayloadTooLargeError'
    ) {
      this.response.code = HttpStatus.PAYLOAD_TOO_LARGE;
      this.response.message = (exception as any).message;

      this.logger.error(`Message: ${(exception as any).stack}`);

      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json(this.response);
    }

    // Handle generic errors
    if (exception instanceof Error) {
      if (exception.message.includes('path must be absolute')) {
        return response.status(HttpStatus.NOT_FOUND).end('File does not exist');
      }

      this.response.code = HttpStatus.INTERNAL_SERVER_ERROR;
      this.response.message = 'Something went wrong!';
      this.logger.error(`Message: ${exception.stack}`);

      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(this.response);
    }

    // Fallback for unknown errors
    this.logger.error('Unhandled exception', exception);
    this.response.code = HttpStatus.INTERNAL_SERVER_ERROR;
    this.response.message = 'Something went wrong!';

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(this.response);
  }
}

@Catch(WsException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    console.log('we are here');
    const client = host.switchToWs().getClient() as WebSocket;
    const data = host.switchToWs().getData();

    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();

    const details = error instanceof Object ? { ...error } : { message: error };

    client.send(
      JSON.stringify({
        event: 'error',
        data: {
          id: (client as any).id,
          rid: data.rid,
          ...details,
        },
      }),
    );
  }
}
