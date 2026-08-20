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

function computeOverall(reportCard) {
  if (!reportCard || !reportCard.length) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const entry of reportCard) {
    const value = gradeToValue.get((entry.grade || "").toUpperCase());
    if (!value) continue;
    const weight =
      entry.weight != null && entry.weight > 0 ? entry.weight : DEFAULT_WEIGHT;
    weightedSum += value * weight;
    totalWeight += weight;
  }
  if (totalWeight <= 0) return null;
  const avg = weightedSum / totalWeight;
  const rounded = Math.min(gradeScale.length, Math.max(1, Math.round(avg)));
  return valueToGrade.get(rounded) || null;
}

module.exports = { gradeScale, gradeToValue, valueToGrade, DEFAULT_WEIGHT, computeOverall };
