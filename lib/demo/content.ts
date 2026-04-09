import type { ExamTaskTypeDto, SubjectDto } from "@/schemas/subject";
import type { TaskBankItemDto, TaskCriterionDto } from "@/schemas/task";

type RubricKind =
  | "russian-essay"
  | "language-letter"
  | "language-essay"
  | "math-solution"
  | "physics-qualitative"
  | "physics-solution"
  | "chemistry-chain"
  | "chemistry-problem"
  | "biology-analysis"
  | "history-source"
  | "history-argument"
  | "social-theory"
  | "social-plan"
  | "social-mini-essay"
  | "literature-analysis"
  | "literature-essay"
  | "geography-analysis"
  | "informatics-code";

type DemoTaskTypeSeed = {
  taskNumber: number;
  code: string;
  name: string;
  description: string;
  maxScore: number;
  difficulty: "BASIC" | "MEDIUM" | "HARD";
  tags: string[];
  rubricKind: RubricKind;
};

type DemoSubjectSeed = {
  id: string;
  code: string;
  name: string;
  taskTypes: DemoTaskTypeSeed[];
};

type CriterionSeed = Omit<TaskCriterionDto, "id">;

type DemoTaskTypeDescriptor = DemoTaskTypeSeed & {
  subjectCode: string;
  subjectName: string;
};

const demoCatalog: DemoSubjectSeed[] = [
  {
    id: "demo-subject-russian",
    code: "russian",
    name: "Русский язык",
    taskTypes: [
      {
        taskNumber: 27,
        code: "essay",
        name: "Сочинение-рассуждение",
        description: "Проблема текста, комментарий, позиция автора, собственная позиция и речевая грамотность.",
        maxScore: 22,
        difficulty: "HARD",
        tags: ["essay", "writing", "second_part"],
        rubricKind: "russian-essay"
      }
    ]
  },
  {
    id: "demo-subject-math-profile",
    code: "math_profile",
    name: "Математика профиль",
    taskTypes: [
      { taskNumber: 13, code: "equation", name: "Уравнение", description: "Тригонометрические, показательные и смешанные уравнения.", maxScore: 2, difficulty: "HARD", tags: ["algebra", "equation", "second_part"], rubricKind: "math-solution" },
      { taskNumber: 15, code: "inequality", name: "Неравенство", description: "Рациональные, логарифмические и показательные неравенства.", maxScore: 2, difficulty: "HARD", tags: ["algebra", "inequality", "second_part"], rubricKind: "math-solution" },
      { taskNumber: 16, code: "planimetry", name: "Планиметрия", description: "Геометрическая задача с доказательством и вычислением.", maxScore: 3, difficulty: "HARD", tags: ["geometry", "planimetry", "second_part"], rubricKind: "math-solution" },
      { taskNumber: 17, code: "economics", name: "Экономическая задача", description: "Финансовая математика, кредиты, вклады и прикладные вычисления.", maxScore: 3, difficulty: "HARD", tags: ["economics", "finance", "second_part"], rubricKind: "math-solution" },
      { taskNumber: 18, code: "parameter", name: "Задача с параметром", description: "Исследование выражений, систем и уравнений с параметром.", maxScore: 4, difficulty: "HARD", tags: ["parameter", "analysis", "second_part"], rubricKind: "math-solution" },
      { taskNumber: 19, code: "number_theory", name: "Теория чисел", description: "Задача на делимость, оценки и логические конструкции.", maxScore: 4, difficulty: "HARD", tags: ["number_theory", "logic", "second_part"], rubricKind: "math-solution" }
    ]
  },
  {
    id: "demo-subject-physics",
    code: "physics",
    name: "Физика",
    taskTypes: [
      { taskNumber: 20, code: "qualitative", name: "Качественная задача", description: "Развёрнутое объяснение физического явления или процесса.", maxScore: 2, difficulty: "MEDIUM", tags: ["qualitative", "second_part"], rubricKind: "physics-qualitative" },
      { taskNumber: 21, code: "mechanics", name: "Механика", description: "Расчётная задача повышенной сложности по механике.", maxScore: 3, difficulty: "HARD", tags: ["mechanics", "second_part"], rubricKind: "physics-solution" },
      { taskNumber: 22, code: "mkt", name: "Молекулярная физика и термодинамика", description: "Расчётная задача по молекулярной физике и термодинамике.", maxScore: 3, difficulty: "HARD", tags: ["thermo", "second_part"], rubricKind: "physics-solution" },
      { taskNumber: 23, code: "electrodynamics", name: "Электродинамика", description: "Расчётная задача по электричеству и магнетизму.", maxScore: 3, difficulty: "HARD", tags: ["electrodynamics", "second_part"], rubricKind: "physics-solution" },
      { taskNumber: 24, code: "optics", name: "Оптика и квантовая физика", description: "Комбинированная задача на оптику, квантовые и ядерные процессы.", maxScore: 3, difficulty: "HARD", tags: ["optics", "quantum", "second_part"], rubricKind: "physics-solution" },
      { taskNumber: 25, code: "combined", name: "Комбинированная расчётная задача", description: "Многошаговая задача по нескольким разделам курса.", maxScore: 3, difficulty: "HARD", tags: ["combined", "second_part"], rubricKind: "physics-solution" },
      { taskNumber: 26, code: "experiment", name: "Экспериментальная задача", description: "Планирование эксперимента и анализ установки.", maxScore: 2, difficulty: "MEDIUM", tags: ["experiment", "second_part"], rubricKind: "physics-qualitative" }
    ]
  },
  {
    id: "demo-subject-chemistry",
    code: "chemistry",
    name: "Химия",
    taskTypes: [
      { taskNumber: 29, code: "reaction-chain", name: "Цепочка превращений", description: "Составление уравнений реакций и объяснение превращений.", maxScore: 2, difficulty: "MEDIUM", tags: ["reactions", "second_part"], rubricKind: "chemistry-chain" },
      { taskNumber: 30, code: "redox", name: "ОВР или ионные уравнения", description: "Окислительно-восстановительные реакции и сокращённые ионные уравнения.", maxScore: 2, difficulty: "MEDIUM", tags: ["redox", "ions", "second_part"], rubricKind: "chemistry-chain" },
      { taskNumber: 31, code: "inorganic", name: "Неорганическая химия", description: "Развёрнутая цепочка по неорганическим веществам и их свойствам.", maxScore: 4, difficulty: "HARD", tags: ["inorganic", "second_part"], rubricKind: "chemistry-chain" },
      { taskNumber: 32, code: "organic", name: "Органическая химия", description: "Цепочка превращений и свойства органических веществ.", maxScore: 5, difficulty: "HARD", tags: ["organic", "second_part"], rubricKind: "chemistry-chain" },
      { taskNumber: 33, code: "calculation", name: "Расчётная задача", description: "Задача на вычисления по химическим формулам и уравнениям реакций.", maxScore: 4, difficulty: "HARD", tags: ["calculation", "second_part"], rubricKind: "chemistry-problem" },
      { taskNumber: 34, code: "combined", name: "Комбинированная расчётная задача", description: "Многошаговая задача с расчётами и анализом химических процессов.", maxScore: 4, difficulty: "HARD", tags: ["combined", "second_part"], rubricKind: "chemistry-problem" }
    ]
  },
  {
    id: "demo-subject-biology",
    code: "biology",
    name: "Биология",
    taskTypes: [
      { taskNumber: 22, code: "cytology", name: "Цитология и генетика", description: "Развёрнутый ответ по клетке, наследственности и молекулярным процессам.", maxScore: 2, difficulty: "MEDIUM", tags: ["biology", "genetics", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 23, code: "data-analysis", name: "Анализ биологических данных", description: "Разбор таблиц, схем и экспериментальных результатов.", maxScore: 3, difficulty: "MEDIUM", tags: ["analysis", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 24, code: "organism", name: "Организм человека", description: "Анатомия, физиология и регуляция функций организма.", maxScore: 3, difficulty: "MEDIUM", tags: ["human", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 25, code: "evolution", name: "Эволюция и экология", description: "Эволюционные механизмы, адаптации и экологические связи.", maxScore: 3, difficulty: "MEDIUM", tags: ["evolution", "ecology", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 26, code: "application", name: "Практико-ориентированная биология", description: "Применение биологических знаний к реальным ситуациям.", maxScore: 3, difficulty: "MEDIUM", tags: ["application", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 27, code: "genetics-problem", name: "Генетическая задача", description: "Развёрнутая генетическая задача с обоснованием хода решения.", maxScore: 3, difficulty: "HARD", tags: ["genetics", "second_part"], rubricKind: "biology-analysis" },
      { taskNumber: 28, code: "molecular", name: "Молекулярная биология", description: "Задача на биосинтез белка, ДНК, РНК и наследственную информацию.", maxScore: 3, difficulty: "HARD", tags: ["molecular", "second_part"], rubricKind: "biology-analysis" }
    ]
  },
  {
    id: "demo-subject-history",
    code: "history",
    name: "История",
    taskTypes: [
      { taskNumber: 20, code: "source-attribution", name: "Атрибуция источника", description: "Определение эпохи, событий и участников по историческому источнику.", maxScore: 2, difficulty: "MEDIUM", tags: ["source", "second_part"], rubricKind: "history-source" },
      { taskNumber: 21, code: "source-analysis", name: "Анализ исторического источника", description: "Развёрнутые ответы по документу с опорой на факты курса.", maxScore: 2, difficulty: "MEDIUM", tags: ["source", "analysis", "second_part"], rubricKind: "history-source" },
      { taskNumber: 22, code: "historical-argument", name: "Историческая аргументация", description: "Аргументы, причинно-следственные связи и сопоставление фактов.", maxScore: 3, difficulty: "HARD", tags: ["argumentation", "second_part"], rubricKind: "history-argument" }
    ]
  },
  {
    id: "demo-subject-social",
    code: "social",
    name: "Обществознание",
    taskTypes: [
      { taskNumber: 17, code: "concepts", name: "Понятия и признаки", description: "Краткий развёрнутый ответ по обществоведческим понятиям.", maxScore: 2, difficulty: "MEDIUM", tags: ["theory", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 18, code: "examples", name: "Примеры к теории", description: "Подбор и объяснение социальных примеров к заданной норме или признаку.", maxScore: 2, difficulty: "MEDIUM", tags: ["examples", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 19, code: "classification", name: "Классификация и функции", description: "Разбор признаков, функций, уровней и видов общественных явлений.", maxScore: 3, difficulty: "MEDIUM", tags: ["classification", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 20, code: "text-analysis", name: "Анализ текста", description: "Работа с обществоведческим текстом и авторской позицией.", maxScore: 2, difficulty: "MEDIUM", tags: ["text", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 21, code: "text-questions", name: "Ответы по тексту", description: "Краткие ответы по содержанию источника и смысловым связям.", maxScore: 2, difficulty: "MEDIUM", tags: ["text", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 22, code: "applied-examples", name: "Практические примеры", description: "Применение теории к социальной, экономической или политической ситуации.", maxScore: 3, difficulty: "MEDIUM", tags: ["application", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 23, code: "constitution", name: "Конституция и право", description: "Развёрнутый ответ по правовым и политическим нормам.", maxScore: 3, difficulty: "MEDIUM", tags: ["law", "politics", "second_part"], rubricKind: "social-theory" },
      { taskNumber: 24, code: "plan", name: "Сложный план", description: "Составление сложного плана по обществоведческой теме.", maxScore: 4, difficulty: "HARD", tags: ["plan", "structure", "second_part"], rubricKind: "social-plan" },
      { taskNumber: 25, code: "mini-essay", name: "Мини-сочинение", description: "Аргументированный ответ с теорией и примерами из общественной жизни.", maxScore: 6, difficulty: "HARD", tags: ["essay", "argumentation", "second_part"], rubricKind: "social-mini-essay" }
    ]
  },
  {
    id: "demo-subject-literature",
    code: "literature",
    name: "Литература",
    taskTypes: [
      { taskNumber: 5, code: "lyric-analysis", name: "Анализ лирики", description: "Развёрнутый ответ по поэтическому тексту.", maxScore: 4, difficulty: "MEDIUM", tags: ["poetry", "second_part"], rubricKind: "literature-analysis" },
      { taskNumber: 6, code: "comparison-lyric", name: "Сопоставление лирики", description: "Сравнение поэтических текстов по заданному основанию.", maxScore: 4, difficulty: "MEDIUM", tags: ["comparison", "poetry", "second_part"], rubricKind: "literature-analysis" },
      { taskNumber: 10, code: "epic-analysis", name: "Анализ прозы или драмы", description: "Развёрнутый ответ по эпическому или драматическому фрагменту.", maxScore: 4, difficulty: "MEDIUM", tags: ["prose", "drama", "second_part"], rubricKind: "literature-analysis" },
      { taskNumber: 11, code: "comparison-epic", name: "Сопоставление прозы и драмы", description: "Сравнительный анализ художественных текстов.", maxScore: 4, difficulty: "MEDIUM", tags: ["comparison", "second_part"], rubricKind: "literature-analysis" },
      { taskNumber: 12, code: "essay", name: "Большое сочинение", description: "Развёрнутое литературное сочинение по выбранной теме.", maxScore: 18, difficulty: "HARD", tags: ["essay", "literature", "second_part"], rubricKind: "literature-essay" }
    ]
  },
  {
    id: "demo-subject-geography",
    code: "geography",
    name: "География",
    taskTypes: [
      { taskNumber: 22, code: "statistics", name: "Анализ статистики", description: "Работа с таблицами, диаграммами и количественными данными.", maxScore: 2, difficulty: "MEDIUM", tags: ["analysis", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 23, code: "map", name: "Картографическая задача", description: "Чтение карты и выводы по географической информации.", maxScore: 2, difficulty: "MEDIUM", tags: ["map", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 24, code: "nature", name: "Природные процессы", description: "Объяснение природных явлений и географических закономерностей.", maxScore: 2, difficulty: "MEDIUM", tags: ["nature", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 25, code: "economy", name: "Экономическая география", description: "Размещение отраслей, ресурсов и производственных связей.", maxScore: 2, difficulty: "MEDIUM", tags: ["economy", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 26, code: "population", name: "Население и урбанизация", description: "Демографические процессы и расселение.", maxScore: 2, difficulty: "MEDIUM", tags: ["population", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 27, code: "global", name: "Глобальные проблемы", description: "Аргументированный ответ по современным географическим процессам.", maxScore: 3, difficulty: "MEDIUM", tags: ["global", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 28, code: "calculation", name: "Расчётная географическая задача", description: "Вычисления и применение формул в географии.", maxScore: 3, difficulty: "HARD", tags: ["calculation", "second_part"], rubricKind: "geography-analysis" },
      { taskNumber: 29, code: "essay", name: "Мини-эссе", description: "Развёрнутый аргументированный ответ по географической теме.", maxScore: 4, difficulty: "HARD", tags: ["essay", "second_part"], rubricKind: "geography-analysis" }
    ]
  },
  {
    id: "demo-subject-informatics",
    code: "informatics",
    name: "Информатика",
    taskTypes: [
      { taskNumber: 24, code: "strings", name: "Обработка строк", description: "Алгоритмическая задача на строки и последовательности.", maxScore: 2, difficulty: "MEDIUM", tags: ["strings", "second_part"], rubricKind: "informatics-code" },
      { taskNumber: 25, code: "executor", name: "Исполнитель и программы", description: "Комбинаторная или поисковая задача на исполнителя.", maxScore: 2, difficulty: "MEDIUM", tags: ["executor", "second_part"], rubricKind: "informatics-code" },
      { taskNumber: 26, code: "data", name: "Таблицы и данные", description: "Практическая задача на обработку и анализ данных.", maxScore: 2, difficulty: "MEDIUM", tags: ["data", "second_part"], rubricKind: "informatics-code" },
      { taskNumber: 27, code: "programming", name: "Программирование", description: "Задача на написание эффективного алгоритма и его реализацию.", maxScore: 4, difficulty: "HARD", tags: ["programming", "second_part"], rubricKind: "informatics-code" }
    ]
  },
  {
    id: "demo-subject-english",
    code: "english",
    name: "Английский язык",
    taskTypes: [
      { taskNumber: 37, code: "letter", name: "Письменный ответ", description: "Личное письмо или короткое развёрнутое письменное высказывание.", maxScore: 6, difficulty: "MEDIUM", tags: ["writing", "second_part"], rubricKind: "language-letter" },
      { taskNumber: 38, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание с анализом данных или мнений.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"], rubricKind: "language-essay" }
    ]
  }
];

function createTaskTypeId(subjectCode: string, code: string) {
  return `demo-type-${subjectCode}-${code}`;
}

function createTaskId(subjectCode: string, code: string) {
  return `demo-task-${subjectCode}-${code}`;
}

function distributeScore(maxScore: number, parts: number[]) {
  const totalWeight = parts.reduce((sum, part) => sum + part, 0);
  let remaining = maxScore;

  return parts.map((part, index) => {
    if (index === parts.length - 1) {
      return remaining;
    }

    const value = Math.max(1, Math.round((maxScore * part) / totalWeight));
    remaining -= value;
    return value;
  });
}

function distributeScoreTuple(maxScore: number, parts: [number, number, number, number]): [number, number, number, number] {
  const values = distributeScore(maxScore, parts);

  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0, values[3] ?? 0];
}

function withIds(taskTypeId: string, criteria: CriterionSeed[]): TaskCriterionDto[] {
  return criteria.map((criterion, index) => ({
    id: `${taskTypeId}-criterion-${index + 1}`,
    ...criterion
  }));
}

function buildCriteriaByRubric(kind: RubricKind, maxScore: number): CriterionSeed[] {
  switch (kind) {
    case "russian-essay":
      return [
        { code: "K1", title: "Проблема текста", description: "Проблема исходного текста сформулирована точно и без подмены темы.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Комментарий к проблеме", description: "Даны два содержательных примера-иллюстрации и показана смысловая связь между ними.", maxScore: 3, sortOrder: 2 },
        { code: "K3", title: "Позиция автора", description: "Позиция автора исходного текста сформулирована верно.", maxScore: 1, sortOrder: 3 },
        { code: "K4", title: "Собственная позиция", description: "Позиция ученика выражена ясно и обоснована.", maxScore: 2, sortOrder: 4 },
        { code: "K5", title: "Фактическая и логическая точность", description: "Нет фактических ошибок, логических срывов и противоречий.", maxScore: 3, sortOrder: 5 },
        { code: "K6", title: "Речевая и языковая грамотность", description: "Соблюдены нормы речи, грамматики, орфографии и пунктуации.", maxScore: 12, sortOrder: 6 }
      ];
    case "language-letter":
      return [
        { code: "K1", title: "Решение коммуникативной задачи", description: "Все аспекты задания раскрыты и адресат получает полный ответ.", maxScore: 2, sortOrder: 1 },
        { code: "K2", title: "Организация текста", description: "Есть логика, абзацы, корректные связки и оформление письма.", maxScore: 2, sortOrder: 2 },
        { code: "K3", title: "Языковое оформление", description: "Грамматика, лексика и орфография позволяют засчитать ответ без серьёзных потерь.", maxScore: 2, sortOrder: 3 }
      ];
    case "language-essay":
      return [
        { code: "K1", title: "Решение коммуникативной задачи", description: "Тема раскрыта, позиция выражена, аргументы и вывод соответствуют формату задания.", maxScore: 3, sortOrder: 1 },
        { code: "K2", title: "Организация текста", description: "Есть логичное деление на абзацы, вступление, основная часть и вывод.", maxScore: 3, sortOrder: 2 },
        { code: "K3", title: "Лексика и грамматика", description: "Использована уместная лексика и достаточный грамматический диапазон.", maxScore: 4, sortOrder: 3 },
        { code: "K4", title: "Орфография и пунктуация", description: "Ошибки не искажают смысл и не превышают критический порог.", maxScore: 4, sortOrder: 4 }
      ];
    case "math-solution":
    case "physics-solution":
    case "chemistry-problem":
    case "informatics-code": {
      const scoreParts: [number, number, number, number] =
        maxScore <= 2
          ? [1, 0, 0, 1]
          : maxScore === 3
            ? [1, 1, 0, 1]
            : maxScore === 4
              ? [1, 1, 1, 1]
              : distributeScoreTuple(maxScore, [1, 2, 1, 1]);

      const [understanding, reasoning, calculations, answer] = scoreParts;

      return [
        { code: "K1", title: "Понимание условия", description: "Выбран верный подход, обозначены нужные величины, формулы или идея решения.", maxScore: understanding, sortOrder: 1 },
        ...(reasoning > 0
          ? [{ code: "K2", title: "Ход решения", description: "Решение развёрнуто по шагам и логически непротиворечиво.", maxScore: reasoning, sortOrder: 2 }]
          : []),
        ...(calculations > 0
          ? [{ code: "K3", title: "Промежуточные вычисления", description: "Преобразования, вычисления и переходы выполнены корректно.", maxScore: calculations, sortOrder: 3 }]
          : []),
        { code: reasoning > 0 || calculations > 0 ? "K4" : "K2", title: "Итоговый ответ", description: "Финальный ответ записан в требуемом формате и согласован с решением.", maxScore: answer, sortOrder: 4 }
      ];
    }
    case "physics-qualitative":
      return [
        { code: "K1", title: "Физическая модель", description: "Названы нужные законы, явления или условия эксперимента.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Объяснение", description: "Дано причинно-следственное объяснение без противоречий.", maxScore: Math.max(1, maxScore - 1), sortOrder: 2 }
      ];
    case "chemistry-chain": {
      const [equations, explanation, formatting] = maxScore === 2 ? [1, 0, 1] : maxScore === 4 ? [2, 1, 1] : [2, 2, 1];
      return [
        { code: "K1", title: "Уравнения реакций", description: "Записаны нужные уравнения и верно выбраны реагенты и продукты.", maxScore: equations, sortOrder: 1 },
        ...(explanation > 0
          ? [{ code: "K2", title: "Логика цепочки", description: "Переходы между веществами обоснованы и не содержат химических ошибок.", maxScore: explanation, sortOrder: 2 }]
          : []),
        { code: explanation > 0 ? "K3" : "K2", title: "Корректность оформления", description: "Соблюдены коэффициенты, условия реакции и требования записи.", maxScore: formatting, sortOrder: 3 }
      ];
    }
    case "biology-analysis":
      return [
        { code: "K1", title: "Содержание ответа", description: "Названы ключевые объекты, процессы или признаки.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Объяснение и аргументация", description: "Ответ объяснён на языке биологии, без подмены понятий и фактических ошибок.", maxScore: Math.max(1, maxScore - 2), sortOrder: 2 },
        { code: "K3", title: "Точность вывода", description: "Сделан корректный вывод по условию задания или данным.", maxScore: 1, sortOrder: 3 }
      ];
    case "history-source":
      return [
        { code: "K1", title: "Опора на источник", description: "Извлечены и верно использованы ключевые сведения из исторического источника.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Историческая точность", description: "Нет фактических ошибок в датах, лицах, событиях и терминах.", maxScore: Math.max(1, maxScore - 1), sortOrder: 2 }
      ];
    case "history-argument":
      return [
        { code: "K1", title: "Факты и аргументы", description: "Приведены релевантные факты и аргументы по условию задания.", maxScore: 2, sortOrder: 1 },
        { code: "K2", title: "Причинно-следственные связи", description: "Показана логика событий и связь между приведёнными фактами.", maxScore: 1, sortOrder: 2 }
      ];
    case "social-plan":
      return [
        { code: "K1", title: "Пункты плана", description: "План раскрывает тему и содержит не менее трёх содержательных пунктов.", maxScore: 2, sortOrder: 1 },
        { code: "K2", title: "Подпункты и детализация", description: "Есть корректная детализация подпунктами и логичное построение структуры.", maxScore: 2, sortOrder: 2 }
      ];
    case "social-mini-essay":
      return [
        { code: "K1", title: "Теоретическая основа", description: "Использованы понятия и положения курса без искажений.", maxScore: 2, sortOrder: 1 },
        { code: "K2", title: "Аргументация", description: "Позиция раскрыта через полноценные аргументы и вывод.", maxScore: 2, sortOrder: 2 },
        { code: "K3", title: "Примеры", description: "Приведены конкретные социальные примеры, подтверждающие рассуждение.", maxScore: 2, sortOrder: 3 }
      ];
    case "social-theory":
      return [
        { code: "K1", title: "Содержательная точность", description: "Ответ соответствует теории и формулировке задания.", maxScore: Math.max(1, maxScore - 1), sortOrder: 1 },
        { code: "K2", title: "Полнота ответа", description: "Все элементы вопроса раскрыты без пропусков.", maxScore: 1, sortOrder: 2 }
      ];
    case "literature-analysis":
      return [
        { code: "K1", title: "Понимание текста", description: "Ученик точно понимает эпизод, образ или художественный приём.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Анализ и аргументация", description: "Выводы подтверждены текстом произведения и литературоведческими наблюдениями.", maxScore: Math.max(1, maxScore - 2), sortOrder: 2 },
        { code: "K3", title: "Речевая точность", description: "Нет серьёзных речевых, фактических и логических ошибок.", maxScore: 1, sortOrder: 3 }
      ];
    case "literature-essay":
      return [
        { code: "K1", title: "Раскрытие темы", description: "Тема сочинения раскрыта без ухода в пересказ и подмены вопроса.", maxScore: 4, sortOrder: 1 },
        { code: "K2", title: "Привлечение текста", description: "Использованы аргументы и наблюдения по произведениям, а не общие фразы.", maxScore: 5, sortOrder: 2 },
        { code: "K3", title: "Композиция и логика", description: "Сочинение цельное, с понятной логикой и корректными переходами.", maxScore: 3, sortOrder: 3 },
        { code: "K4", title: "Речевая грамотность", description: "Соблюдены речевые, фактические и грамматические нормы.", maxScore: 6, sortOrder: 4 }
      ];
    case "geography-analysis":
      return [
        { code: "K1", title: "Анализ данных", description: "Корректно использованы карта, таблица, диаграмма или географические факты.", maxScore: 1, sortOrder: 1 },
        { code: "K2", title: "Объяснение", description: "Показана географическая логика ответа и выявлены причины или закономерности.", maxScore: Math.max(1, maxScore - 2), sortOrder: 2 },
        { code: "K3", title: "Вывод", description: "Сформулирован точный итоговый вывод по условию задания.", maxScore: 1, sortOrder: 3 }
      ];
  }
}

const taskTypeIndex = new Map<string, DemoTaskTypeDescriptor>();

for (const subject of demoCatalog) {
  for (const taskType of subject.taskTypes) {
    taskTypeIndex.set(createTaskTypeId(subject.code, taskType.code), {
      ...taskType,
      subjectCode: subject.code,
      subjectName: subject.name
    });
  }
}

export function buildDefaultCriteriaForTaskType(input: {
  subjectCode: string;
  taskTypeCode: string;
  taskTypeName: string;
  taskNumber: number;
  maxScore: number;
}): CriterionSeed[] {
  const demoTaskType = taskTypeIndex.get(createTaskTypeId(input.subjectCode, input.taskTypeCode));
  const rubricKind = demoTaskType?.rubricKind ?? "math-solution";

  return buildCriteriaByRubric(rubricKind, input.maxScore);
}

function buildReferenceSolution(subjectName: string, taskTypeName: string) {
  return [
    `Эталонный ответ по теме «${taskTypeName}» предмета «${subjectName}».`,
    "В ответе должна быть видна логика решения или аргументации, а также прямое соответствие критериям проверки.",
    "Если задача расчётная, нужно показать ход рассуждений и итоговый ответ.",
    "Если задача гуманитарная, важно раскрыть тему, привести доказательства и сделать ясный вывод."
  ].join(" ");
}

export const demoSubjects: SubjectDto[] = demoCatalog.map((subject) => ({
  id: subject.id,
  code: subject.code,
  name: subject.name,
  isActive: true
}));

export const demoTaskTypes: ExamTaskTypeDto[] = demoCatalog.flatMap((subject) =>
  subject.taskTypes.map((taskType) => ({
    id: createTaskTypeId(subject.code, taskType.code),
    subjectId: subject.id,
    taskNumber: taskType.taskNumber,
    code: taskType.code,
    name: taskType.name,
    description: taskType.description,
    maxScore: taskType.maxScore,
    difficulty: taskType.difficulty,
    tags: taskType.tags,
    sourceStatus: "DEMO_SEED",
    isActive: true
  }))
);

export const demoTasks: TaskBankItemDto[] = demoCatalog.flatMap((subject) =>
  subject.taskTypes.map((taskType) => {
    const taskTypeId = createTaskTypeId(subject.code, taskType.code);
    const criteria = withIds(
      taskTypeId,
      buildDefaultCriteriaForTaskType({
        subjectCode: subject.code,
        taskTypeCode: taskType.code,
        taskTypeName: taskType.name,
        taskNumber: taskType.taskNumber,
        maxScore: taskType.maxScore
      })
    );

    return {
      id: createTaskId(subject.code, taskType.code),
      subjectId: subject.id,
      taskTypeId,
      year: 2026,
      sourceType: "demo_seed",
      sourceUrl: null,
      title: taskType.name,
      problemText: `Демо-задание по теме «${taskType.name}». Здесь можно проверить сценарий показа условия, загрузку решения, разбор по критериям и ответ AI-эксперта. Если у тебя есть реальные материалы по этой теме, их можно догрузить через админский раздел и заменить демо-карточку на фото и текст настоящего задания.`,
      assetsJson: null,
      maxScore: taskType.maxScore,
      metaJson: {
        demo: true,
        subjectCode: subject.code,
        taskNumber: taskType.taskNumber
      },
      sourceStatus: "DEMO_SEED",
      isPublished: true,
      taskType: demoTaskTypes.find((item) => item.id === taskTypeId),
      subject: demoSubjects.find((item) => item.id === subject.id),
      criteria,
      referenceSolution: {
        id: `demo-reference-${subject.code}-${taskType.code}`,
        solutionText: buildReferenceSolution(subject.name, taskType.name),
        notes: "Демо-эталон. Для реальной проверки лучше заменить на верифицированный ответ или собственный методический эталон.",
        rubricJson: {
          demo: true,
          rubricKind: taskType.rubricKind
        }
      }
    };
  })
);

export function getDemoTaskTypesBySubjectId(subjectId: string) {
  return demoTaskTypes.filter((item) => item.subjectId === subjectId);
}

export function getDemoTasksByTaskTypeId(taskTypeId: string) {
  return demoTasks.filter((item) => item.taskTypeId === taskTypeId);
}

export function getDemoTaskById(taskId: string) {
  return demoTasks.find((item) => item.id === taskId) ?? null;
}
