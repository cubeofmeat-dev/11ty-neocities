module.exports = function (eleventyConfig) {
  // Copy CSS file to output
  eleventyConfig.addPassthroughCopy("src/index.css");
  eleventyConfig.addPassthroughCopy("src/images");

  // Filter to give h1s snes class with cycling colors
  eleventyConfig.addFilter("gameFormat", function (content) {
    const colors = [
      "has-plumber-underline",
      "has-nature-underline",
      "has-sunshine-underline",
      "has-ocean-underline",
      "has-turquoise-underline",
      "has-phantom-underline",
      "has-rose-underline",
      "has-galaxy-underline",
      "has-ember-underline",
    ];
    let colorIndex = 0;

    // Replace h1 tags with classes and cycle through colors
    let formatted = content.replace(
      /<h1>(.*?)<\/h1>/gi,
      (_, title) => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return `<h1 class="snes-container-title ${color}">${title}</h1>`;
      },
    );

    //todo figure out map so that way I can map rating of title from h2s to color instead of just cycling through them
    colorIndex = 0; // Reset color index for h2 tags
    formatted = formatted.replace(
      /<h2>(.*?)<\/h2>/gi,
      (_, title) => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return `<h2 class="snes-container-title ${color}">${title}</h2>`;
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
