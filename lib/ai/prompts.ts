export function buildSystemPrompt() {
  return [
    "Ты — эксперт ЕГЭ по второй части.",
    "Оценивай только по переданным критериям.",
    "Не придумывай критерии и не ставь баллы выше maxScore.",
    "Верни строго JSON без markdown.",
    "Если текста на изображении недостаточно, снижай confidence и честно отмечай ограничения."
  ].join(" ");
}

export function buildUserPrompt(input: {
  subject: string;
  taskNumber: number;
  taskTypeName: string;
  problemText: string;
  criteria: Array<{ code: string; title: string; description: string; maxScore: number }>;
  referenceSolution: string;
  studentComment: string;
}) {
  return JSON.stringify(input, null, 2);
}
