import { JSDOM } from "jsdom";
import fs from "node:fs";
import type { Paper } from "./types";

const PAPERS_FILE_PATH = "./db/papers.json";

export async function loadPapers(
  papersFilePath = PAPERS_FILE_PATH
): Promise<Paper[]> {
  try {
    if (!fs.existsSync(PAPERS_FILE_PATH)) {
      console.log("Creating papers.json");
      await Bun.write(PAPERS_FILE_PATH, JSON.stringify([]));
    }
    const papersFile = Bun.file(PAPERS_FILE_PATH);
    return JSON.parse(await papersFile.text());
  } catch (error) {
    console.error("Failed to load papers:", error);
    throw new Error("Error loading papers data");
  }
}

export function splitKeywords(inputString: string): string[] {
  const splitRegex = /,(?![^{\[\(<]*[\]\)}>])/;
  const resplitRegex = / ·|-|–||\/ /;
  return inputString
    .split(splitRegex)
    .map((s) => s.split(resplitRegex))
    .flat()
    .map((s) => s.trim());
}

// Checks if the cache directory for a specific ID exists
export async function cacheDirExists(
  id: string,
  cacheDir = "./cache"
): Promise<boolean> {
  const cachePath = `${cacheDir}/${id}`;
  return fs.existsSync(cachePath);
}

// Creates the cache directory if it doesn't exist
export async function createCacheDir(
  id: string,
  cacheDir = "./cache"
): Promise<void> {
  const cachePath = `${cacheDir}/${id}`;
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
}

// Fetches HTML from the URL
export async function fetchHtml(
  id: string,
  cacheDir = "./cache"
): Promise<string> {
  console.log(`Getting ${id}`);
  const res = await fetch(`https://ling.auf.net/lingbuzz/${id}`);
  return res.text();
}

// Reads the HTML from the cache
export async function readCachedHtml(
  id: string,
  cacheDir = "./cache"
): Promise<string> {
  console.log(`${id} already exists, using cached html`);
  return Bun.file(`${cacheDir}/${id}/index.html`).text();
}

// Writes the fetched HTML to the cache
export async function writeHtmlToCache(
  id: string,
  html: string,
  cacheDir = "./cache"
): Promise<void> {
  await Bun.write(`${cacheDir}/${id}/index.html`, html);
}

// The modularized getHtml function
export async function getHtml(
  id: string,
  cacheDir = "./cache"
): Promise<string> {
  let html = "";

  if (!(await cacheDirExists(id))) {
    await createCacheDir(id);
    html = await fetchHtml(id);
  } else if (!fs.existsSync(`${cacheDir}/${id}/index.html`)) {
    html = await fetchHtml(id);
  } else {
    html = await readCachedHtml(id);
  }

  await writeHtmlToCache(id, html);

  return html;
}

export function parseCenterElement(document: Document): string[] {
  const centerElement = document.querySelector("body > center");
  if (!centerElement) return [];

  const linesWithHtml = centerElement.innerHTML.split(/<br\s*\/?>/gi);

  const lines = linesWithHtml
    .map((line) => {
      const tempDom = new JSDOM(`<div>${line}</div>`);
      return (
        tempDom.window.document.querySelector("div")?.textContent?.trim() || ""
      );
    })
    .filter(Boolean); // Filter out any empty strings

  return lines;
}

export function parseTable(document: Document): Map<string, string> {
  const table = document.querySelector("body > table");
  if (!table) {
    console.error("Table not found in the document.");
    return new Map();
  }

  const tableDataMap = new Map<string, string>();
  table.querySelectorAll("tr").forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td"))
      .map((td) => td.textContent?.trim())
      .filter(Boolean); // This removes any falsy values, including empty strings

    if (cells.length >= 2) {
      const key = (cells[0] ?? "").replace(":", "");
      const value = cells[1] || "";
      tableDataMap.set(key, value);
    }
  });

  return tableDataMap;
}

export function parseAbstract(rawAbstract: string): string {
  return rawAbstract
    .replace(/"/g, "'")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ");
}

export async function updatePapers(
  papers: Paper[],
  newPapers: Paper[]
): Promise<Paper[]> {
  for (const item of papers) {
    const exists = newPapers.some((obj) => obj.id === item.id);
    if (!exists) {
      newPapers.push(item);
    }
  }
  return newPapers;
}
