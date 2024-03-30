import fs from "node:fs";

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
