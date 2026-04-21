// FILE: src/data/config/utils.ts
// ROLE: Utility functions strictly related to data manipulation for config or global state
// READS FROM: None
// USED BY: useProducts, configuration logic

// ARCHITECTURE: sortCategories
// PURPOSE: Sorts an array of category strings based on a predefined order array. Unknown categories fall to the end alphabetically.
// DEPENDENCIES: None
// CONSUMERS: useProducts (category ordering)
export const sortCategories = (categories: string[], order: string[]) => {
  return [...categories].sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};
