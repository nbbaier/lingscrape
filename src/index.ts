import { JSDOM } from "jsdom";
import type { Paper } from "./types";
import {
  getHtml,
  loadPapers,
  parseAbstract,
  parseCenterElement,
  parseTable,
  splitKeywords,
  updatePapers,
} from "./utils";

const PAPERS_FILE_PATH = "./db/papers.json";
const papers: Paper[] = [];

const args = Bun.argv.slice(2);

const START_ID = parseInt(args[0]) || 2;
const END_ID = parseInt(args[1]) || 8004;

async function main() {
  console.time("main");
  for (let i = START_ID; i <= END_ID; i++) {
    try {
      const id = i.toString().padStart(6, "0");
      const html = await getHtml(id);

      const document = new JSDOM(html).window.document;

      const pageTitle = document.querySelector("title")?.textContent;

      if (pageTitle === "lingbuzz - archive of linguistics articles") {
        console.log(`No paper found for ${id}`);
        continue;
      }

      const header = parseCenterElement(document);
      const rowTexts = parseTable(document);

      const title = header[0].replace(/"/g, "'").trim();
      const authors = header[1].split(",").map((author) => author.trim());
      const date = header[2] ? header[2].trim() : "";
      const published_in = rowTexts.get("Published in") || "";
      const keywords_raw = rowTexts.get("keywords") || "";
      const keywords = splitKeywords(keywords_raw);
      const downloads = rowTexts.get("Downloaded")
        ? parseInt(rowTexts.get("Downloaded")?.split(" ")[0] as string)
        : 0;

      const rawAbstract = document.querySelector("body")?.childNodes[5]
        .textContent as string;

      const abstract = !/^Format:/.test(rawAbstract)
        ? parseAbstract(rawAbstract)
        : "";

      papers.push({
        id: id,
        title,
        authors,
        date,
        published_in,
        keywords_raw,
        keywords,
        abstract,
        downloads,
        link: `https://ling.auf.net/lingbuzz/${id}`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  let newPapers = await loadPapers();
  const updatedPapersData = await updatePapers(papers, newPapers);

  await Bun.write(
    PAPERS_FILE_PATH,
    JSON.stringify(
      updatedPapersData.filter((item) => Object.keys(item).length !== 0)
    )
  );

  console.timeEnd("main");
}

main();
