const { computeOverall } = require("../../utils/gradeUtils.js");

module.exports = {
  eleventyComputed: {
    ratings(data) {
      if (!data.ratings) return data.ratings;
      return data.ratings.map((entry) => {
        if (!entry.reportCard) return entry;
        const grade = computeOverall(entry.reportCard);
        return { ...entry, grade };
      });
    },
  },
};
