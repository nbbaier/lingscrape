import type { Paper } from "../types";

export async function updatePapers(
  papers: Paper[],
  newPapers: Paper[]
): Promise<Paper[]> {
  try {
    for (const item of papers) {
      const exists = newPapers.some((obj) => obj.id === item.id);
      if (!exists) {
        newPapers.push(item);
      }
    }
    return newPapers;
  } catch (error) {
    console.error("Failed to load papers:", error);
    throw new Error("Error loading papers data");
  }
}
