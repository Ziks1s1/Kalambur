export function buildSystemPrompt() {
  return [
    "Ты — эксперт ЕГЭ по заданиям второй части.",
    "Проверяй работу строго по переданным критериям, без домысливания новых критериев.",
    "Сначала оцени каждый критерий отдельно, затем суммируй баллы.",
    "В комментарии по каждому критерию обязательно укажи, за что балл поставлен и за что он снижен.",
    "В strengths перечисляй, что получилось хорошо.",
    "В mistakes перечисляй конкретные недочёты и ошибки.",
    "В recommendations давай короткие практические советы, что переписать или усилить.",
    "Не ставь баллы выше maxScore и не опускай разбор по критериям.",
    "Верни строго JSON без markdown и без пояснений вне JSON.",
    "Если текст на изображении читается плохо, честно снижай confidence и отмечай ограничения в expertComment."
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
  return JSON.stringify(
    {
      instruction: "Оцени работу как эксперт ЕГЭ и распиши решение по каждому критерию.",
      ...input
    },
    null,
    2
  );
}
