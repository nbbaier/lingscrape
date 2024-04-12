import fs from "node:fs";

async function cacheDirExists(
  id: string,
  cacheDir = "./cache"
): Promise<boolean> {
  const cachePath = `${cacheDir}/${id}`;
  return fs.existsSync(cachePath);
}

async function createCacheDir(id: string, cacheDir = "./cache"): Promise<void> {
  const cachePath = `${cacheDir}/${id}`;
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
}
async function fetchHtml(id: string, cacheDir = "./cache"): Promise<string> {
  console.log(`Getting ${id}`);
  const res = await fetch(`https://ling.auf.net/lingbuzz/${id}`);
  return res.text();
}

async function readCachedHtml(
  id: string,
  cacheDir = "./cache"
): Promise<string> {
  console.log(`${id} already exists, using cached html`);
  return Bun.file(`${cacheDir}/${id}/index.html`).text();
}

async function writeHtmlToCache(
  id: string,
  html: string,
  cacheDir = "./cache"
): Promise<void> {
  await Bun.write(`${cacheDir}/${id}/index.html`, html);
}

export async function getHtml(
  id: string,
  cacheDir = "./cache"
): Promise<string> {
  try {
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
  } catch (error) {
    console.error("Failed to get html:", error);
    throw new Error("Error getting html");
  }
}
