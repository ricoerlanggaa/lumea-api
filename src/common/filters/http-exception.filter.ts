import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { HttpResponse } from '../interfaces/http-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: HttpResponse['error'] = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as {
          statusCode?: number;
          message?: string | string[];
          error?: string;
        };
        message = Array.isArray(resObj.message)
          ? 'Validation failed'
          : (resObj.message ?? exception.message);

        if (Array.isArray(resObj.message)) {
          error = this.formatValidationErrors(resObj.message);
        }
      }
    } else if (this.isMongooseValidationError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = Object.entries(exception.errors).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          acc[key] = value.message;
          return acc;
        },
        {},
      );
    } else if (this.isMongooseCastError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid identifier';
      error = { [exception.path]: `Invalid value for ${exception.path}` };
    } else if (this.isMongoServerError(exception) && exception.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Duplicate key error';
      const duplicateField = Object.keys(exception.keyPattern ?? {})[0] ?? 'field';
      error = { [duplicateField]: `${duplicateField} already exists` };
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody: HttpResponse = {
      status: 'error',
      message,
      data: null,
      error,
    };

    res.status(statusCode).json(responseBody);
  }

  private formatValidationErrors(messages: string[]): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const msg of messages) {
      const [field, ...rest] = msg.trim().split(' ');
      if (!field || rest.length === 0) {
        formatted['unknown'] = msg;
      } else {
        formatted[field] = rest.join(' ') || 'is invalid';
      }
    }
    return formatted;
  }

  private isMongooseValidationError(error: unknown): error is mongoose.Error.ValidationError {
    return error instanceof mongoose.Error.ValidationError && typeof error.errors === 'object';
  }

  private isMongooseCastError(error: unknown): error is mongoose.Error.CastError {
    return error instanceof mongoose.Error.CastError && typeof error.path === 'string';
  }

  private isMongoServerError(
    error: unknown,
  ): error is { code: number; keyPattern?: Record<string, unknown> } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as Record<string, unknown>).code === 'number'
    );
  }
}
