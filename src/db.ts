import { type Paper } from "./types";
import { createClient } from "@libsql/client";
import { papers } from "./testPapers";

const client = createClient({
  url: process.env.TURSO_DB_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

for (const paper of papers) {
  const {
    _id,
    title,
    authors,
    keywords_raw,
    date,
    published_in,
    abstract,
    downloads,
  } = paper;

  await client.execute({
    sql: `insert into papers (id, title, authors, date, published_in, keywords_raw, abstract, downloads)
    values (:id, :title, :authors, :date, :published_in, :keywords_raw, :abstract, :downloads)`,
    args: {
      id: _id,
      title,
      authors: authors.join(", "),
      date,
      published_in,
      keywords_raw,
      abstract,
      downloads,
    },
  });
}

console.log(await client.execute("select * from papers"));
