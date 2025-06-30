import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { HttpResponse } from '../interfaces/http-response.interface';

type HandlerOutput<T> = T | { data: T; message?: string };

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<HandlerOutput<T>, HttpResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler<HandlerOutput<T>>): Observable<HttpResponse<T>> {
    return next.handle().pipe(
      map((data): HttpResponse<T> => {
        if (typeof data === 'object' && data !== null && 'data' in data) {
          return {
            status: 'success',
            message: data.message ?? 'Request successful',
            data: data.data,
            error: null,
          };
        }

        return {
          status: 'success',
          message: 'Request successful',
          data,
          error: null,
        };
      }),
    );
  }
}
