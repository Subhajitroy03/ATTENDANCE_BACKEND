declare module "pg" {
  export interface QueryResultRow {
    [column: string]: unknown;
  }

  export interface QueryResult<R extends QueryResultRow = QueryResultRow> {
    rows: R[];
    rowCount: number | null;
  }

  export interface PoolConfig {
    connectionString?: string | undefined;
    max?: number;
    ssl?: boolean | { rejectUnauthorized?: boolean };
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<R extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<R>>;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
}
