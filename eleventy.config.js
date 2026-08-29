const { gradeScale, gradeToValue, valueToGrade, DEFAULT_CATEGORY_WEIGHTS, computeOverall } = require("./utils/gradeUtils.js");

module.exports = function (eleventyConfig) {
  function stripTags(html) {
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  // Fallback: parse an already-rendered HTML table to compute the overall grade.
  // Used for legacy monthly files that still have inline report card tables.
  function computeWeightedOverall(tableHtml) {
    const tableHeaderMatch = tableHtml.match(/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/i);
    if (!tableHeaderMatch) return null;

    const headerCells = [...tableHeaderMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
      stripTags(m[1]).toLowerCase()
    );

    const categoryIndex = headerCells.findIndex((c) => c.includes("category"));
    const gradeIndex = headerCells.findIndex((c) => c.includes("grade"));
    const weightIndex = headerCells.findIndex((c) => c.includes("weight"));

    if (categoryIndex === -1 || gradeIndex === -1) return null;

    const columnCount = headerCells.length;
    const rowMatches = [...tableHtml.matchAll(/<tbody>[\s\S]*?<\/tbody>/gi)];
    if (!rowMatches.length) return null;

    const defaultCategoryWeights = DEFAULT_CATEGORY_WEIGHTS;

    let weightedSum = 0;
    let totalWeight = 0;
    let hasOverallRow = false;

    for (const tbodyMatch of rowMatches) {
      const trMatches = [...tbodyMatch[0].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
      for (const trMatch of trMatches) {
        const cellMatches = [...trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        if (!cellMatches.length) continue;

        const cells = cellMatches.map((m) => stripTags(m[1]));
        const category = (cells[categoryIndex] || "").trim().toLowerCase();
        const gradeRaw = (cells[gradeIndex] || "").trim().toUpperCase();

        if (category.startsWith("overall")) { hasOverallRow = true; continue; }
        if (!gradeRaw) continue;

        const gradeValue = gradeToValue.get(gradeRaw);
        if (!gradeValue) continue;

        const weightRaw =
          weightIndex >= 0
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
    const roundedValue = Math.min(gradeScale.length, Math.max(1, Math.round(averageValue)));
    return { roundedValue, overallGrade: valueToGrade.get(roundedValue) || "N/A", columnCount, hasOverallRow };
  }

  // Build the styled report card section from a front matter reportCard array.
  function renderReportCardFromData(entry) {
    const overall = computeOverall(entry.reportCard);
    const rows = entry.reportCard
      .map((cat) => `<tr><td>${cat.category}</td><td>${cat.grade}</td></tr>`)
      .join("");
    const overallRow = `<tr class="review-overall-row"><td><strong>Overall</strong></td><td><strong>${overall || "?"}</strong></td></tr>`;
    return (
      `<section class="review-card" aria-label="Review report card">` +
      `<div class="review-card-head"><h4 class="review-card-title">Review Report Card</h4></div>` +
      `<table class="review-card-table">` +
      `<thead><tr><th>Category</th><th>Grade</th></tr></thead>` +
      `<tbody>${rows}${overallRow}</tbody>` +
      `</table></section>`
    );
  }

  // Build the styled report card section from a legacy inline HTML table.
  function renderReportCardFromHtml(tableContent) {
    const weighted = computeWeightedOverall(`<table>${tableContent}</table>`);
    let finalTableContent = tableContent;
    if (weighted && weighted.hasOverallRow) {
      finalTableContent = tableContent.replace(
        /<tr>([\s\S]*?<td[^>]*>\s*(?:<strong>)?\s*Overall(?:\s*\(Weighted\))?\s*(?:<\/strong>)?\s*<\/td>\s*)<td[^>]*>[\s\S]*?<\/td>([\s\S]*?)<\/tr>/i,
        `<tr class="review-overall-row">$1<td><strong>${weighted.overallGrade}</strong></td>$2</tr>`
      );
    } else if (weighted) {
      const weightedCells = [
        `<td><strong>Overall (Weighted)</strong></td>`,
        `<td><strong>${weighted.overallGrade}</strong></td>`,
      ];
      if (weighted.columnCount >= 3) weightedCells.push("<td></td>");
      const overallRow = `<tr class="review-overall-row">${weightedCells.join("")}</tr>`;

      if (/<\/tbody>/i.test(tableContent)) {
        finalTableContent = tableContent.replace(/<\/tbody>/i, `${overallRow}</tbody>`);
      } else if (/<thead>[\s\S]*<\/thead>/i.test(tableContent)) {
        finalTableContent = `${tableContent}<tbody>${overallRow}</tbody>`;
      } else {
        finalTableContent = `<tbody>${tableContent}${overallRow}</tbody>`;
      }
    }

    return (
      `<section class="review-card" aria-label="Review report card">` +
      `<div class="review-card-head"><h4 class="review-card-title">Review Report Card</h4></div>` +
      `<table class="review-card-table">${finalTableContent}</table>` +
      `</section>`
    );
  }

  eleventyConfig.addPassthroughCopy("src/index.css");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("gameMonths", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("games")
      .filter((item) => item.data.ratings || item.data.pageType === "month");
  });

  eleventyConfig.addCollection("gameEntries", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("games")
      .filter((item) => item.data.pageType === "game")
      .sort((left, right) => String(left.data.playedDate || "").localeCompare(String(right.data.playedDate || "")));
  });

  eleventyConfig.addCollection("gameRatings", function (collectionApi) {
    const records = [];

    for (const item of collectionApi.getFilteredByTag("games")) {
      if (item.data.pageType === "game" && item.data.grade) {
        records.push({
          game: item.data.title,
          grade: item.data.grade,
          year: item.data.year,
          month: item.data.month,
          monthKey: item.data.monthKey,
        });
      }

      for (const rating of item.data.ratings || []) {
        if (rating.grade) {
          records.push({
            game: rating.game,
            grade: rating.grade,
            year: item.data.year,
            month: item.data.month,
            monthKey: `${item.data.year}-${String(item.data.month).padStart(2, "0")}`,
          });
        }
      }
    }

    return records;
  });

  eleventyConfig.addFilter("gameFormat", function (content, ratings, reportCard) {
    const colorMap = new Map([
      ["F", "has-plumber-underline"],
      ["B", "has-nature-underline"],
      ["S", "has-sunshine-underline"],
      ["A", "has-ocean-underline"],
      ["C", "has-turquoise-underline"],
      ["2", "has-phantom-underline"],
      ["3", "has-rose-underline"],
      ["1", "has-galaxy-underline"],
      ["D", "has-ember-underline"],
    ]);

    const ratingMap = new Map([
      ["F", "text-plumber-color"],
      ["D", "text-ember-color"],
      ["C", "text-turquoise-color"],
      ["B", "text-nature-color"],
      ["A", "text-ocean-color"],
      ["S", "text-sunshine-color"],
      ["2", "text-phantom-color"],
      ["3", "text-rose-color"],
      ["1", "text-galaxy-color"],
    ]);

    let colorIndex = 0;
    let formatted = content.replace(/<h1>(.*?)<\/h1>/gi, (_, title) => {
      const color = Array.from(colorMap.values())[colorIndex % colorMap.size];
      colorIndex++;
      return `<h1 class="snes-container-title ${color}">${title}</h1>`;
    });

    formatted = formatted.replace(/<h2>(.*?)<\/h2>/gi, (_, title) => {
      const color = ratingMap.get(title.trim()[0]);
      return `<h2 class="${color}">${title}</h2>`;
    });

    // Replace each Report Card section. Only ratings entries that have a reportCard array
    // are eligible for front matter rendering — this keeps non-itemized games (that carry
    // a manual grade but no reportCard) from consuming a slot in the index.
    const ratingsWithCard = reportCard
      ? [{ reportCard }]
      : (ratings || []).filter((e) => e.reportCard);
    let reportCardIndex = 0;
    formatted = formatted.replace(
      /<h4[^>]*>\s*Report Card\s*<\/h4>(\s*<table[^>]*>([\s\S]*?)<\/table>)?/gi,
      (match, _tableWrapper, tableContent) => {
        const entry = ratingsWithCard[reportCardIndex];
        reportCardIndex++;

        if (entry && entry.reportCard) {
          return renderReportCardFromData(entry);
        }
        if (tableContent) {
          return renderReportCardFromHtml(tableContent);
        }
        return match;
      }
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
