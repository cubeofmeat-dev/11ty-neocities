module.exports = function (eleventyConfig) {
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
