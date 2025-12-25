module.exports = function (eleventyConfig) {
  // Add a paired shortcode for rendering XP windows from content
  eleventyConfig.addPairedShortcode("xpwindows", function (content) {
    if (!content) return "";

    // Split by <h2> tags (content is already rendered HTML)
    const sections = content.split(/(?=<h2>)/i);

    const windows = sections
      .filter((s) => s.trim())
      .map((section) => {
        // Extract title from <h2>...</h2>
        const titleMatch = section.match(/<h2>(.*?)<\/h2>/i);
        const title = titleMatch ? titleMatch[1] : "Untitled";
        // Remove the h2 from the body
        const body = section.replace(/<h2>.*?<\/h2>/i, "").trim();

        return `
    <div class="window">
      <div class="title-bar">
        <div class="title-bar-text">${title}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div class="window-body">
        ${body}
      </div>
    </div>`;
      });

    return windows.join("\n");
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
