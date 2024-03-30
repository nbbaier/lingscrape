import { createClient } from "@libsql/client";
import { loadPapers } from "./utils";

const papers = await loadPapers();

const client = createClient({
  url: process.env.TURSO_DB_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function main() {
  console.time("main");
  for (const paper of papers) {
    const {
      id,
      title,
      authors,
      keywords_raw,
      date,
      published_in,
      abstract,
      downloads,
    } = paper;

    console.log(`Inserting paper ${id}`);

    await client.execute({
      sql: `insert into papers (id, title, authors, date, published_in, keywords_raw, abstract, downloads)
    values (:id, :title, :authors, :date, :published_in, :keywords_raw, :abstract, :downloads)`,
      args: {
        id,
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

  console.log(await client.execute("select count(*) from papers"));
  console.timeEnd("main");
}

main();
