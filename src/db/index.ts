import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(env?: any) {
  if (env && env.DB) {
    return drizzle(env.DB, { schema });
  }
  // Fallback for local development or static builds if env is not yet bound
  return null;
}

export { schema };
