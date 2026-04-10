type PromptCriterion = {
  code: string;
  title: string;
  description: string;
  maxScore: number;
};

type BuildUserPromptInput = {
  taskId: string;
  subject: string;
  taskNumber: number;
  taskTypeName: string;
  problemText: string;
  criteria: PromptCriterion[];
  criteriaText?: string;
  referenceSolution: string;
  referenceAnswer?: string;
  answerFormat?: string;
  studentComment: string;
};

function buildCriteriaText(criteria: PromptCriterion[], override?: string) {
  if (override?.trim()) {
    return override.trim();
  }

  return criteria
    .map(
      (criterion) =>
        `${criterion.code}. ${criterion.title} (макс. ${criterion.maxScore})\n${criterion.description}`.trim()
    )
    .join("\n\n");
}

function buildReferenceText(referenceSolution: string, referenceAnswer?: string) {
  if (referenceAnswer?.trim()) {
    return [`Краткий правильный ответ: ${referenceAnswer.trim()}`, `Эталонное решение: ${referenceSolution.trim()}`].join(
      "\n\n"
    );
  }

  return referenceSolution.trim();
}

function getDefaultAnswerFormat(subject: string, taskNumber: number, taskTypeName: string) {
  const normalizedSubject = subject.toLowerCase();

  if (normalizedSubject.includes("математика")) {
    switch (taskNumber) {
      case 13:
        return "ответ по пунктам а и б с полным решением уравнения";
      case 14:
        return "доказательство в пункте а и вычисление/ответ в пункте б";
      case 15:
        return "развёрнутое решение и итоговый ответ";
      case 16:
        return "математическая модель и итоговый ответ";
      case 17:
        return "доказательство в пункте а и вычисление/ответ в пункте б";
      case 18:
        return "развёрнутое исследование и все значения параметра";
      case 19:
        return "ответы по пунктам а, б и в с обоснованием";
      default:
        return "развёрнутое решение";
    }
  }

  return `развёрнутый ответ по типу задания «${taskTypeName}»`;
}

function buildStudentSolutionText(studentComment: string) {
  const normalized = studentComment.trim();

  if (normalized) {
    return normalized;
  }

  return "Текстовая расшифровка отсутствует; ориентируйся на изображение работы участника.";
}

export function buildSystemPrompt() {
  return [
    "Ты — ИИ-проверяющий развёрнутых ответов ЕГЭ.",
    "Работай строго по переданным критериям и верни результат только в JSON-формате.",
    "Никакого текста вне JSON."
  ].join(" ");
}

export function buildUserPrompt(input: BuildUserPromptInput) {
  const maxScore = input.criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  const criteriaText = buildCriteriaText(input.criteria, input.criteriaText);
  const answerFormat = input.answerFormat?.trim() || getDefaultAnswerFormat(input.subject, input.taskNumber, input.taskTypeName);
  const referenceText = buildReferenceText(input.referenceSolution, input.referenceAnswer);
  const studentSolutionText = buildStudentSolutionText(input.studentComment);

  return `Ты — ИИ-проверяющий развёрнутых ответов ЕГЭ.

Твоя задача: проверить решение участника СТРОГО по переданным критериям оценивания к конкретному заданию.

Работай как эксперт предметной комиссии ФИПИ по следующему протоколу:

1. Проверяй ТОЛЬКО по предоставленным материалам:
- текст задания,
- критерии оценивания,
- эталонный ответ / эталонное решение,
- ответ и решение участника.

2. Нельзя:
- придумывать дополнительные критерии;
- ставить штрафы, которых нет в критериях;
- ставить баллы "за общее впечатление";
- завышать или занижать оценку из-за стиля, почерка или оформления, если это не предусмотрено критериями;
- засчитывать то, чего нет в работе участника;
- снижать балл за то, что не указано в критериях.

3. Нужно:
- выставлять баллы строго по каждому критерию отдельно;
- затем считать итоговый балл как сумму баллов по критериям;
- кратко и точно объяснять, за что поставлен каждый балл и за что он снят;
- ссылаться именно на критерии, а не на общие рассуждения;
- сравнивать решение участника с эталоном только в рамках критериев.

4. Если правильный ответ дан, но по критериям требуется обоснование, решение, пояснение, доказательство или промежуточные шаги, не ставь полный балл только за конечный верный ответ. Следуй критериям строго.

5. Если участник допустил ошибку в начале, но дальнейшие шаги формально верны относительно его промежуточного результата, учитывай это только если такая логика допускается переданными критериями.

6. Если часть решения нечитабельна, оценивай только достоверно различимую часть. Не додумывай текст. Обязательно укажи, что часть решения не удалось уверенно распознать.

7. Если критерии допускают несколько равноправных способов решения, засчитывай любой корректный способ, даже если он не совпадает с эталонным, но соответствует критериям.

8. Если критерии требуют строгого совпадения ответа, проверяй строгое соответствие.
Если критерии допускают эквивалентные формулировки, засчитывай эквивалентный по смыслу ответ.

9. Итоговый стиль проверки:
- строго,
- формально,
- без лишней мягкости,
- без домысливания,
- без "поощрительных" баллов,
- максимально близко к экспертной проверке ЕГЭ.

10. Верни результат только в заданном JSON-формате.
Никакого текста вне JSON. Проверь работу участника строго по критериям.

ДАННЫЕ ЗАДАНИЯ:
Task ID: ${input.taskId}
Предмет: ${input.subject}
Номер задания: ${input.taskNumber}
Тип задания: ${input.taskTypeName}
Максимальный балл: ${maxScore}

ТЕКСТ ЗАДАНИЯ:
${input.problemText.trim()}

КРИТЕРИИ ОЦЕНИВАНИЯ:
${criteriaText}

ЭТАЛОННЫЙ ОТВЕТ / ЭТАЛОННОЕ РЕШЕНИЕ:
${referenceText}

ФОРМАТ ПРАВИЛЬНОГО ОТВЕТА:
${answerFormat}

ОТВЕТ / РЕШЕНИЕ УЧАСТНИКА:
${studentSolutionText}

ДОПОЛНИТЕЛЬНО:
- Если приложено изображение решения, используй его как основной источник.
- Если есть OCR/текстовая расшифровка, используй её только как вспомогательный материал.
- Если между изображением и OCR есть расхождения, приоритет у изображения.
- Если часть решения неразборчива, не додумывай её.

ОСОБЫЕ ПРАВИЛА ПРОВЕРКИ:
1. Оцени строго по критериям.
2. Не добавляй собственные требования.
3. Если верный только итоговый ответ, но критерии требуют решение, не ставь полный балл.
4. Если ответ неверный, но есть частично верные элементы, оцени их только если это допускают критерии.
5. Объясняй решение по каждому критерию отдельно.
6. Итоговый балл должен быть равен сумме выставленных баллов по критериям.
7. Если данных недостаточно для полного зачёта, ставь столько, сколько можно обосновать по критериям, и не больше.

Верни результат строго в JSON по указанной схеме.`;
}
