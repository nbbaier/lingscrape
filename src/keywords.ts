// const file = Bun.file("./db/papers.json");
// const papers = JSON.parse(await file.text());

// console.log(papers.length);

// const keywords = new Set<string>();

// for (const paper of papers) {
//   for (const keyword of paper.keywords) {
//     keywords.add(keyword);
//   }
// }

// console.log(
//   keywords.size,
//   Array.from(keywords).filter((k) => k !== "" && k !== " ").length
// );

const string = `agree – case – interface conditions - overt movement, arabic – datives - external possession – possessor raising – context-linked grammar, (agent) pseudo-incorporation · event kinds · event tokens · two-layered argument structure · dependent case · dependent φ-agreement, sentential subjects, minimal labeling algorithm, φ-features, {xp, yp} structure, <φ, φ> label, syntax`;

function splitAndTrim(inputString: string): string[] {
  const splitRegex = /,(?![^{\[\(<]*[\]\)}>])/;
  const resplitRegex = / ·|-|–||\/ /;
  return inputString
    .split(splitRegex)
    .map((s) => s.split(resplitRegex))
    .flat()
    .map((s) => s.trim());
}
