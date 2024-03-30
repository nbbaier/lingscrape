import { createClient, type InStatement, type Client } from "@libsql/client";
import Table from "easy-table";

const client = createClient({
  url: process.env.TURSO_DB_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

type QueryResult = {
  [k: string]: string;
};

const runQuery = async (
  stmt: InStatement,
  client: Client
): Promise<QueryResult[]> => {
  const { columns, rows } = (await client.execute(stmt)).toJSON();

  return rows.map((row: string[]) =>
    Object.fromEntries(columns.map((key: string, i: number) => [key, row[i]]))
  );
};
