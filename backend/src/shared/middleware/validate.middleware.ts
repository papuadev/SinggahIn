import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

function parseTarget(schema: ZodSchema | undefined, target: unknown): unknown {
  return schema ? schema.parse(target) : target;
}

export function validateRequest(schema: RequestValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) req.body = parseTarget(schema.body, req.body);
      if (schema.query) req.query = parseTarget(schema.query, req.query) as any;
      if (schema.params) req.params = parseTarget(schema.params, req.params) as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
