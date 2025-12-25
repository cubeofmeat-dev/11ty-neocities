module.exports = function (eleventyConfig) {
  // Add a paired shortcode for rendering game reviews as table rows
  eleventyConfig.addPairedShortcode("gamereviews", function (content) {
    if (!content) return "";

    // Split by <h2> tags (content is already rendered HTML)
    const sections = content.split(/(?=<h2>)/i);

    const rows = sections
      .filter((s) => s.trim())
      .map((section) => {
        // Extract title from <h2>...</h2>
        const titleMatch = section.match(/<h2>(.*?)<\/h2>/i);
        const title = titleMatch ? titleMatch[1] : "Untitled";

        // Remove the h2 from the body
        let body = section.replace(/<h2>.*?<\/h2>/i, "").trim();

        // Parse metadata lines (logo:, rating:, ratingColor:) from the first <p> tag
        let logo = "";
        let rating = "";
        let ratingColor = "black";

        // Look for metadata in the first paragraph
        const metaMatch = body.match(/<p>(logo:.*?)<\/p>/is);
        if (metaMatch) {
          const metaBlock = metaMatch[1];
          const logoMatch = metaBlock.match(/logo:\s*(.+)/i);
          const ratingMatch = metaBlock.match(/rating:\s*(.+)/i);
          const colorMatch = metaBlock.match(/ratingColor:\s*(.+)/i);

          if (logoMatch) logo = logoMatch[1].trim();
          if (ratingMatch) rating = ratingMatch[1].trim();
          if (colorMatch) ratingColor = colorMatch[1].trim();

          // Remove the metadata paragraph from body
          body = body.replace(/<p>logo:.*?<\/p>/is, "").trim();
        }

        // Generate slug for logo alt/id
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-+$/, "");

        const logoCell = logo
          ? `<td><img id="${slug}-logo" src="${logo}" alt="${slug}-logo" style="max-width: 100px;"></td>`
          : `<td></td>`;

        const ratingHtml = rating
          ? `<p style="text-decoration: underline; color: ${ratingColor};">${rating}</p>`
          : "";

        return `
                        <tr>
                            ${logoCell}
                            <td>
                                <p style="text-decoration: underline;">${title}</p>
                                ${body}
                                ${ratingHtml}
                            </td>
                        </tr>`;
      });

    return rows.join("\n");
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
