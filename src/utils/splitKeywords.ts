export function splitKeywords(inputString: string): string[] {
  const splitRegex = /,(?![^{\[\(<]*[\]\)}>])/;
  const resplitRegex = / ·|-|–||\/ /;
  return inputString
    .split(splitRegex)
    .map((s) => s.split(resplitRegex))
    .flat()
    .map((s) => s.trim());
}

export function splitKeywords2(inputString: string): string[] {
  if (!inputString || inputString.trim() === "") {
    console.error("No keywords");
    return [""];
  }

  try {
    const splitRegex = /,(?![^{\[\(<]*[\]\)}>])/;
    const resplitRegex = / ·|-|–||\/ /;
    return inputString
      .split(splitRegex)
      .map((s) => s.split(resplitRegex))
      .flat()
      .map((s) => s.trim());
  } catch (error) {
    console.error("Error occurred during keyword splitting:", error);
    return [""];
  }
}
