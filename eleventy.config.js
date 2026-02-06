module.exports = function (eleventyConfig) {
  // Copy CSS file to output
  eleventyConfig.addPassthroughCopy("src/index.css");

  // Filter to wrap each h2 section in its own container
  eleventyConfig.addFilter("gameFormat", function (content) {
    if (!content) return "";

    // Split content by h2 tags, keeping the h2s
    const sections = content.split(/(?=<h2>)/gi);

    return sections
      .filter((s) => s.trim())
      .map((section) => {
        // Replace h2 with label.title
        const formatted = section.replace(
          /<h2>(.*?)<\/h2>/gi,
          '<h2 class="title">$1</h2>',
        );
        return `<div class="container">${formatted}</div>`;
      })
      .join("\n");
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
