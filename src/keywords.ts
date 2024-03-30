const file = Bun.file("./db/papers.json");
const papers = JSON.parse(await file.text());

console.log(papers.length);

const keywords = new Set<string>();

for (const paper of papers) {
  for (const keyword of paper.keywords) {
    keywords.add(keyword);
  }
}

console.log(
  keywords.size,
  Array.from(keywords).filter((k) => k !== "" && k !== " ").length
);
