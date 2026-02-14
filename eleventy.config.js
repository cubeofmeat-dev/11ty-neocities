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
