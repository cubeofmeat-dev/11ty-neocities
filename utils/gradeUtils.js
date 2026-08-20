const gradeScale = [
  "F-", "F", "F+",
  "D-", "D", "D+",
  "C-", "C", "C+",
  "B-", "B", "B+",
  "A-", "A", "A+",
  "S",
];

const gradeToValue = new Map(
  gradeScale.map((grade, index) => [grade.toUpperCase(), index + 1])
);

const valueToGrade = new Map(
  gradeScale.map((grade, index) => [index + 1, grade])
);

const DEFAULT_WEIGHT = 25;

const DEFAULT_CATEGORY_WEIGHTS = new Map([
  ["story", 30],
  ["fun factor", 30],
  ["look & feel", 25],
  ["sound & music", 15],
]);

function computeOverall(reportCard) {
  if (!reportCard || !reportCard.length) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const entry of reportCard) {
    const value = gradeToValue.get((entry.grade || "").toUpperCase());
    if (!value) continue;
    const weight =
      DEFAULT_CATEGORY_WEIGHTS.get((entry.category || "").toLowerCase()) ??
      DEFAULT_WEIGHT;
    weightedSum += value * weight;
    totalWeight += weight;
  }
  if (totalWeight <= 0) return null;
  const avg = weightedSum / totalWeight;
  const rounded = Math.min(gradeScale.length, Math.max(1, Math.round(avg)));
  return valueToGrade.get(rounded) || null;
}

module.exports = { gradeScale, gradeToValue, valueToGrade, DEFAULT_WEIGHT, DEFAULT_CATEGORY_WEIGHTS, computeOverall };
