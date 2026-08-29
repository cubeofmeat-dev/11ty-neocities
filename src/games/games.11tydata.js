const { computeOverall } = require("../../utils/gradeUtils.js");

module.exports = {
  eleventyComputed: {
    grade(data) {
      if (!data.reportCard) return data.grade;
      return computeOverall(data.reportCard);
    },
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
