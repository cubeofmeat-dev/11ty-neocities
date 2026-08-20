module.exports = function (eleventyConfig) {
  const gradeScale = [
    "F-",
    "F",
    "F+",
    "D-",
    "D",
    "D+",
    "C-",
    "C",
    "C+",
    "B-",
    "B",
    "B+",
    "A-",
    "A",
    "A+",
    "S",
  ];
  const gradeToValue = new Map(
    gradeScale.map((grade, index) => [grade.toUpperCase(), index + 1]),
  );

  const valueToGrade = new Map();
  gradeScale.forEach((grade, index) => {
    valueToGrade.set(index + 1, grade);
  });

  function stripTags(html) {
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  function computeWeightedOverall(tableHtml) {
    const tableHeaderMatch = tableHtml.match(/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/i);
    if (!tableHeaderMatch) return null;

    const headerCells = [...tableHeaderMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((match) =>
      stripTags(match[1]).toLowerCase(),
    );

    const categoryIndex = headerCells.findIndex((cell) => cell.includes("category"));
    const gradeIndex = headerCells.findIndex((cell) => cell.includes("grade"));
    const weightIndex = headerCells.findIndex((cell) => cell.includes("weight"));

    if (categoryIndex === -1 || gradeIndex === -1) return null;

    const columnCount = headerCells.length;

    const rowMatches = [...tableHtml.matchAll(/<tbody>[\s\S]*?<\/tbody>/gi)];
    if (!rowMatches.length) return null;

    let weightedSum = 0;
    let totalWeight = 0;
    let hasOverallRow = false;

    const defaultCategoryWeights = new Map([
      ["story", 25],
      ["look & feel", 25],
      ["sound & music", 25],
      ["fun factor", 25],
    ]);

    for (const tbodyMatch of rowMatches) {
      const trMatches = [...tbodyMatch[0].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
      for (const trMatch of trMatches) {
        const cellMatches = [...trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        if (!cellMatches.length) continue;

        const cells = cellMatches.map((match) => stripTags(match[1]));
        const category = (cells[categoryIndex] || "").trim().toLowerCase();
        const gradeRaw = (cells[gradeIndex] || "").trim().toUpperCase();

        if (category.startsWith("overall")) {
          hasOverallRow = true;
          continue;
        }

        if (!gradeRaw) continue;

        const gradeValue = gradeToValue.get(gradeRaw);
        if (!gradeValue) continue;

        const weightRaw = weightIndex >= 0
          ? (cells[weightIndex] || "1").trim()
          : String(defaultCategoryWeights.get(category) || 1);
        const parsedWeight = Number.parseFloat(weightRaw);
        const weight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 1;

        weightedSum += gradeValue * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight <= 0) return null;

    const averageValue = weightedSum / totalWeight;
    const roundedValue = Math.min(
      gradeScale.length,
      Math.max(1, Math.round(averageValue)),
    );
    const overallGrade = valueToGrade.get(roundedValue) || "N/A";

    return {
      roundedValue,
      overallGrade,
      columnCount,
      hasOverallRow,
    };
  }

  // Copy CSS file to output
  eleventyConfig.addPassthroughCopy("src/index.css");
  eleventyConfig.addPassthroughCopy("src/images");

  // Filter to give h1s snes class with cycling colors
  eleventyConfig.addFilter("gameFormat", function (content) {
    const colorMap = new Map();
    colorMap.set("F", "has-plumber-underline");
    colorMap.set("B", "has-nature-underline");
    colorMap.set("S", "has-sunshine-underline");
    colorMap.set("A", "has-ocean-underline");
    colorMap.set("C", "has-turquoise-underline");
    colorMap.set("2", "has-phantom-underline");
    colorMap.set("3", "has-rose-underline");
    colorMap.set("1", "has-galaxy-underline");
    colorMap.set("D", "has-ember-underline");

    const ratingMap = new Map();
    ratingMap.set("F", "text-plumber-color");
    ratingMap.set("D", "text-ember-color");
    ratingMap.set("C", "text-turquoise-color");
    ratingMap.set("B", "text-nature-color");
    ratingMap.set("A", "text-ocean-color");
    ratingMap.set("S", "text-sunshine-color");

    ratingMap.set("2", "text-phantom-color");
    ratingMap.set("3", "text-rose-color");
    ratingMap.set("1", "text-galaxy-color");


    // Replace h1 tags with classes and cycle through colors
    let colorIndex = 0;
    let formatted = content.replace(
      /<h1>(.*?)<\/h1>/gi,
      (_, title) => {
        const color = Array.from(colorMap.values())[colorIndex % colorMap.size];
        colorIndex++;
        return `<h1 class="snes-container-title ${color}">${title}</h1>`;
      },
    );

    formatted = formatted.replace(
      /<h2>(.*?)<\/h2>/gi,
      (_, title) => {
        const color = ratingMap.get(title.trim()[0]);
        return `<h2 class="${color}">${title}</h2>`;
      },
    );

    // Convert a markdown-friendly Report Card section into a styled card.
    // Authoring pattern in .md:
    // #### Report Card
    // | Category | Grade | Weight |
    // | --- | --- | --- |
    // | Story | A | 2 |
    // If Weight is omitted, each category defaults to 1.
    formatted = formatted.replace(
      /<h4[^>]*>\s*Report Card\s*<\/h4>\s*<table[^>]*>([\s\S]*?)<\/table>/gi,
      (_, tableContent) => {
        const weighted = computeWeightedOverall(`<table>${tableContent}</table>`);
        const overallBadge = weighted
          ? `<span class="review-card-overall">Overall: ${weighted.overallGrade}</span>`
          : "";

        let finalTableContent = tableContent;
        if (weighted && weighted.hasOverallRow) {
          finalTableContent = tableContent.replace(
            /<tr>([\s\S]*?<td[^>]*>\s*(?:<strong>)?\s*Overall(?:\s*\(Weighted\))?\s*(?:<\/strong>)?\s*<\/td>\s*)<td[^>]*>[\s\S]*?<\/td>([\s\S]*?)<\/tr>/i,
            `<tr class="review-overall-row">$1<td><strong>${weighted.overallGrade}</strong></td>$2</tr>`,
          );
        } else if (weighted && !weighted.hasOverallRow) {
          const weightedCells = [`<td><strong>Overall (Weighted)</strong></td>`, `<td><strong>${weighted.overallGrade}</strong></td>`];
          if (weighted.columnCount >= 3) {
            weightedCells.push("<td></td>");
          }
          const overallRow = `<tr class="review-overall-row">${weightedCells.join("")}</tr>`;

          if (/<\/tbody>/i.test(tableContent)) {
            finalTableContent = tableContent.replace(
              /<\/tbody>/i,
              `${overallRow}</tbody>`,
            );
          } else if (/<thead>[\s\S]*<\/thead>/i.test(tableContent)) {
            finalTableContent = `${tableContent}<tbody>${overallRow}</tbody>`;
          } else {
            finalTableContent = `<tbody>${tableContent}${overallRow}</tbody>`;
          }
        }

        return `<section class="review-card" aria-label="Review report card"><div class="review-card-head"><h4 class="review-card-title">Review Report Card</h4>${overallBadge}</div><table class="review-card-table">${finalTableContent}</table></section>`;
      },
    );

    return formatted;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
