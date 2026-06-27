import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T; message?: string }> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; message?: string }> {
    return next.handle().pipe(
      map((value) => {
        if (value && typeof value === 'object' && 'data' in value) {
          return value as { data: T; message?: string };
        }
        return { data: value };
      }),
    );
  }
}
