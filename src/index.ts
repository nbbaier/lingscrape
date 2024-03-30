import { JSDOM } from "jsdom";
import fs from "node:fs";

type Paper = {
  _id: string;
  title: string;
  authors: string[];
  date: string;
  published_in: string;
  keywords: string[];
  keywords_raw: string;
  abstract: string;
  link: string;
  downloads: string;
};

const cacheDir = "./cache";
const paperFilePath = "./db/papers.json";
if (!fs.existsSync(paperFilePath)) {
  console.log("Creating papers.json");
  await Bun.write(paperFilePath, JSON.stringify([]));
}

const paperFile = Bun.file("./db/papers.json");
const existingPaperMetadata: Paper[] = JSON.parse(await paperFile.text());

const papers: Paper[] = [];

const CENTER_SELECTOR = "body > center";
const TABLE_SELECTOR = "body > table";

async function getHtml(id: string): Promise<string> {
  const cachePath = `${cacheDir}/${id}`;
  let html = "";

  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });

    console.log(`Getting ${id}`);
    const res = await fetch(`https://ling.auf.net/lingbuzz/${id}`);
    html = await res.text();
  } else {
    console.log(`${id} already exists, using cached html`);
    if (!fs.existsSync(`${cacheDir}/${id}/index.html`)) {
      const res = await fetch(`https://ling.auf.net/lingbuzz/${id}`);
      html = await res.text();
    } else {
      html = await Bun.file(`${cacheDir}/${id}/index.html`).text();
    }
  }

  await Bun.write(`${cacheDir}/${id}/index.html`, html);

  return html;
}

function parseCenterElement(document: Document): string[] {
  const centerElement = document.querySelector(CENTER_SELECTOR);
  return (
    centerElement?.innerHTML
      .split("<br>")
      .map((text) => {
        const tempDom = new JSDOM(`<div>${text}</div>`);
        return (
          tempDom.window.document.querySelector("div")?.textContent?.trim() ||
          ""
        );
      })
      .filter(Boolean) || []
  );
}

function parseTable(document: Document): Map<string, string> {
  const table = document.querySelector(TABLE_SELECTOR);
  const rows = Array.from(table?.querySelectorAll("tr") || []);

  return rows.reduce((map, row) => {
    const cells = Array.from(row.querySelectorAll("td")).map(
      (td) => td?.textContent?.trim() || ""
    );
    if (cells.length > 1) {
      map.set(cells[0].replace(":", ""), cells[1]);
    }
    return map;
  }, new Map<string, string>());
}

function parseAbstract(rawAbstract: string): string {
  return rawAbstract
    .replace(/"/g, "'")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ");
}

const START_ID = 2;
const END_ID = 8004;

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

      const title = header[0].trim();
      const authors = header[1].split(",").map((author) => author.trim());
      const date = header[2] ? header[2].trim() : "";
      const published_in = rowTexts.get("Published in") || "";
      const keywords_raw = rowTexts.get("keywords") || "";
      const keywords = rowTexts
        .get("keywords")
        ?.split(", ")
        .map((keyword) => keyword.split("; "))
        .flat()
        .map((keyword) => keyword.replace(/\.$/, "").trim()) || [""];
      const downloads = rowTexts.get("Downloaded") || "";

      const rawAbstract = document.querySelector("body")?.childNodes[5]
        .textContent as string;

      const abstract = !/^Format:/.test(rawAbstract)
        ? parseAbstract(rawAbstract)
        : "";

      papers.push({
        _id: id,
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

  let newPapers = existingPaperMetadata;

  for (const item of papers) {
    const exists = newPapers.some((obj) => obj._id === item._id);
    if (!exists) {
      newPapers.push(item);
    }
  }

  await Bun.write(paperFilePath, JSON.stringify(newPapers));
  console.timeEnd("main");
}

main();
