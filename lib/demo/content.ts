import type { ExamTaskTypeDto, SubjectDto } from "@/schemas/subject";
import type { TaskBankItemDto, TaskCriterionDto } from "@/schemas/task";

type DemoTaskTypeSeed = {
  taskNumber: number;
  code: string;
  name: string;
  description: string;
  maxScore: number;
  difficulty: "BASIC" | "MEDIUM" | "HARD";
  tags: string[];
};

type DemoSubjectSeed = {
  id: string;
  code: string;
  name: string;
  note?: string;
  taskTypes: DemoTaskTypeSeed[];
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
        description: "Формулировка проблемы, комментарий, позиция автора и аргументация.",
        maxScore: 21,
        difficulty: "HARD",
        tags: ["essay", "writing", "second_part"]
      }
    ]
  },
  {
    id: "demo-subject-math-profile",
    code: "math_profile",
    name: "Математика профиль",
    taskTypes: [
      { taskNumber: 13, code: "equation", name: "Уравнение", description: "Тригонометрические, показательные и смешанные уравнения.", maxScore: 2, difficulty: "HARD", tags: ["algebra", "equation", "second_part"] },
      { taskNumber: 15, code: "inequality", name: "Неравенство", description: "Рациональные и логарифмические неравенства второй части.", maxScore: 2, difficulty: "HARD", tags: ["algebra", "inequality", "second_part"] },
      { taskNumber: 16, code: "planimetry", name: "Планиметрия", description: "Геометрическая задача с доказательством и вычислением.", maxScore: 3, difficulty: "HARD", tags: ["geometry", "planimetry", "second_part"] },
      { taskNumber: 17, code: "economics", name: "Экономическая задача", description: "Финансовая математика и прикладные вычисления.", maxScore: 3, difficulty: "HARD", tags: ["economics", "finance", "second_part"] },
      { taskNumber: 18, code: "parameter", name: "Задача с параметром", description: "Исследование выражений и уравнений с параметром.", maxScore: 4, difficulty: "HARD", tags: ["parameter", "analysis", "second_part"] },
      { taskNumber: 19, code: "number_theory", name: "Теория чисел", description: "Олимпиадная задача на числа, делимость и оценки.", maxScore: 4, difficulty: "HARD", tags: ["number_theory", "logic", "second_part"] }
    ]
  },
  {
    id: "demo-subject-math-base",
    code: "math_base",
    name: "Математика база",
    note: "У базовой математики нет второй части с развёрнутым ответом.",
    taskTypes: []
  },
  {
    id: "demo-subject-physics",
    code: "physics",
    name: "Физика",
    taskTypes: [
      { taskNumber: 20, code: "qualitative", name: "Качественная задача", description: "Развёрнутое объяснение физического явления.", maxScore: 2, difficulty: "MEDIUM", tags: ["qualitative", "second_part"] },
      { taskNumber: 21, code: "mechanics", name: "Расчётная задача по механике", description: "Задача повышенной сложности на законы механики.", maxScore: 3, difficulty: "HARD", tags: ["mechanics", "second_part"] },
      { taskNumber: 22, code: "mkt", name: "МКТ и термодинамика", description: "Расчётная задача по молекулярной физике и термодинамике.", maxScore: 3, difficulty: "HARD", tags: ["thermo", "second_part"] },
      { taskNumber: 23, code: "electrodynamics", name: "Электродинамика", description: "Расчётная задача по электричеству и магнетизму.", maxScore: 3, difficulty: "HARD", tags: ["electrodynamics", "second_part"] },
      { taskNumber: 24, code: "quantum", name: "Квантовая и ядерная физика", description: "Комбинированная задача на современные разделы физики.", maxScore: 3, difficulty: "HARD", tags: ["quantum", "second_part"] },
      { taskNumber: 25, code: "combined", name: "Комбинированная задача", description: "Многошаговая расчётная задача по нескольким разделам.", maxScore: 4, difficulty: "HARD", tags: ["combined", "second_part"] },
      { taskNumber: 26, code: "experiment", name: "Экспериментальная задача", description: "Планирование эксперимента и обработка результатов.", maxScore: 2, difficulty: "MEDIUM", tags: ["experiment", "second_part"] }
    ]
  },
  {
    id: "demo-subject-chemistry",
    code: "chemistry",
    name: "Химия",
    taskTypes: Array.from({ length: 18 }, (_, index) => {
      const taskNumber = index + 17;
      return {
        taskNumber,
        code: `chemistry_${taskNumber}`,
        name: `Задание ${taskNumber}`,
        description: `Развёрнутая задача второй части по химии № ${taskNumber}.`,
        maxScore: taskNumber >= 30 ? 4 : 2,
        difficulty: taskNumber >= 30 ? "HARD" : "MEDIUM",
        tags: ["chemistry", "second_part"]
      } satisfies DemoTaskTypeSeed;
    })
  },
  {
    id: "demo-subject-biology",
    code: "biology",
    name: "Биология",
    taskTypes: [
      { taskNumber: 22, code: "cytology", name: "Цитология и генетика", description: "Развёрнутый ответ по цитологии, генетике и клетке.", maxScore: 2, difficulty: "MEDIUM", tags: ["biology", "genetics", "second_part"] },
      { taskNumber: 23, code: "analysis", name: "Анализ биологических данных", description: "Разбор таблиц, схем и экспериментальных результатов.", maxScore: 3, difficulty: "MEDIUM", tags: ["analysis", "second_part"] },
      { taskNumber: 24, code: "organism", name: "Организм человека", description: "Развёрнутая задача по анатомии и физиологии.", maxScore: 3, difficulty: "MEDIUM", tags: ["human", "second_part"] },
      { taskNumber: 25, code: "evolution", name: "Эволюция и экология", description: "Задача на систематику, эволюцию и экологические связи.", maxScore: 3, difficulty: "MEDIUM", tags: ["evolution", "ecology", "second_part"] },
      { taskNumber: 26, code: "application", name: "Практико-ориентированная биология", description: "Применение знаний к биологическим ситуациям.", maxScore: 3, difficulty: "MEDIUM", tags: ["application", "second_part"] },
      { taskNumber: 27, code: "genetics_advanced", name: "Генетическая задача", description: "Многошаговая генетическая задача с объяснением.", maxScore: 4, difficulty: "HARD", tags: ["genetics", "second_part"] },
      { taskNumber: 28, code: "molecular", name: "Молекулярная биология", description: "Сложная задача на биосинтез белка, ДНК и РНК.", maxScore: 4, difficulty: "HARD", tags: ["molecular", "second_part"] }
    ]
  },
  {
    id: "demo-subject-history",
    code: "history",
    name: "История",
    taskTypes: [
      { taskNumber: 20, code: "source_attribution", name: "Атрибуция источника", description: "Определение эпохи, автора и контекста исторического источника.", maxScore: 2, difficulty: "MEDIUM", tags: ["source", "second_part"] },
      { taskNumber: 21, code: "source_analysis", name: "Анализ источника", description: "Развёрнутые ответы по историческому документу.", maxScore: 2, difficulty: "MEDIUM", tags: ["source", "analysis", "second_part"] },
      { taskNumber: 22, code: "historical_argument", name: "Историческая аргументация", description: "Сопоставление фактов и формулировка причинно-следственных связей.", maxScore: 3, difficulty: "HARD", tags: ["argumentation", "second_part"] }
    ]
  },
  {
    id: "demo-subject-social",
    code: "social",
    name: "Обществознание",
    taskTypes: [
      { taskNumber: 17, code: "concepts", name: "Понятия и признаки", description: "Краткий развёрнутый ответ по обществоведческим понятиям.", maxScore: 2, difficulty: "MEDIUM", tags: ["theory", "second_part"] },
      { taskNumber: 18, code: "examples", name: "Примеры к теории", description: "Подбор и объяснение социальных примеров.", maxScore: 2, difficulty: "MEDIUM", tags: ["examples", "second_part"] },
      { taskNumber: 19, code: "classification", name: "Классификация и признаки", description: "Разбор признаков, функций и видов явлений.", maxScore: 3, difficulty: "MEDIUM", tags: ["classification", "second_part"] },
      { taskNumber: 20, code: "text_analysis", name: "Анализ текста", description: "Работа с обществоведческим текстом и выводами автора.", maxScore: 2, difficulty: "MEDIUM", tags: ["text", "second_part"] },
      { taskNumber: 21, code: "text_questions", name: "Ответы по тексту", description: "Краткие ответы по содержанию источника.", maxScore: 2, difficulty: "MEDIUM", tags: ["text", "second_part"] },
      { taskNumber: 22, code: "applied_examples", name: "Практические примеры", description: "Социальные ситуации и их объяснение через теорию.", maxScore: 3, difficulty: "MEDIUM", tags: ["application", "second_part"] },
      { taskNumber: 23, code: "constitution", name: "Конституция и право", description: "Развёрнутый ответ по правовым и политическим нормам.", maxScore: 3, difficulty: "MEDIUM", tags: ["law", "politics", "second_part"] },
      { taskNumber: 24, code: "plan", name: "Сложный план", description: "Развёрнутый план по обществоведческой теме.", maxScore: 4, difficulty: "HARD", tags: ["plan", "structure", "second_part"] },
      { taskNumber: 25, code: "mini_essay", name: "Мини-сочинение", description: "Аргументированный ответ с теорией и примерами.", maxScore: 6, difficulty: "HARD", tags: ["essay", "argumentation", "second_part"] }
    ]
  },
  {
    id: "demo-subject-literature",
    code: "literature",
    name: "Литература",
    taskTypes: [
      { taskNumber: 5, code: "lyric_analysis", name: "Анализ лирики", description: "Развёрнутый ответ по поэтическому тексту.", maxScore: 4, difficulty: "MEDIUM", tags: ["poetry", "second_part"] },
      { taskNumber: 6, code: "comparison_lyric", name: "Сопоставление лирики", description: "Сравнение поэтических текстов.", maxScore: 4, difficulty: "MEDIUM", tags: ["comparison", "poetry", "second_part"] },
      { taskNumber: 10, code: "epic_analysis", name: "Анализ эпического фрагмента", description: "Развёрнутый ответ по прозе или драме.", maxScore: 4, difficulty: "MEDIUM", tags: ["prose", "drama", "second_part"] },
      { taskNumber: 11, code: "comparison_epic", name: "Сопоставление прозы и драмы", description: "Сравнительный анализ художественных текстов.", maxScore: 4, difficulty: "MEDIUM", tags: ["comparison", "second_part"] },
      { taskNumber: 12, code: "essay_literature", name: "Большое сочинение", description: "Развёрнутое литературное сочинение по выбранной теме.", maxScore: 18, difficulty: "HARD", tags: ["essay", "literature", "second_part"] }
    ]
  },
  {
    id: "demo-subject-geography",
    code: "geography",
    name: "География",
    taskTypes: [
      { taskNumber: 22, code: "table_analysis", name: "Анализ статистики", description: "Работа с таблицами, диаграммами и картографическими данными.", maxScore: 2, difficulty: "MEDIUM", tags: ["analysis", "second_part"] },
      { taskNumber: 23, code: "map_reading", name: "Картографическая задача", description: "Чтение карты и выводы по географической информации.", maxScore: 2, difficulty: "MEDIUM", tags: ["map", "second_part"] },
      { taskNumber: 24, code: "natural_processes", name: "Природные процессы", description: "Объяснение природных явлений и закономерностей.", maxScore: 2, difficulty: "MEDIUM", tags: ["nature", "second_part"] },
      { taskNumber: 25, code: "economy", name: "Экономическая география", description: "Развёрнутый ответ по размещению отраслей и ресурсов.", maxScore: 2, difficulty: "MEDIUM", tags: ["economy", "second_part"] },
      { taskNumber: 26, code: "population", name: "Население и урбанизация", description: "Задача по демографии и расселению.", maxScore: 2, difficulty: "MEDIUM", tags: ["population", "second_part"] },
      { taskNumber: 27, code: "global_issues", name: "Глобальные проблемы", description: "Аргументированный ответ по современным географическим процессам.", maxScore: 3, difficulty: "MEDIUM", tags: ["global", "second_part"] },
      { taskNumber: 28, code: "calculation", name: "Расчётная географическая задача", description: "Вычисления и применение формул в географии.", maxScore: 3, difficulty: "HARD", tags: ["calculation", "second_part"] },
      { taskNumber: 29, code: "essay_geo", name: "Мини-эссе", description: "Развёрнутый аргументированный ответ по географической теме.", maxScore: 4, difficulty: "HARD", tags: ["essay", "second_part"] }
    ]
  },
  {
    id: "demo-subject-informatics",
    code: "informatics",
    name: "Информатика",
    taskTypes: [
      { taskNumber: 24, code: "string_processing", name: "Обработка строк", description: "Алгоритмическая задача на строки и последовательности.", maxScore: 2, difficulty: "MEDIUM", tags: ["strings", "second_part"] },
      { taskNumber: 25, code: "executor", name: "Исполнитель и программы", description: "Комбинаторная или поисковая задача на исполнителя.", maxScore: 2, difficulty: "MEDIUM", tags: ["executor", "second_part"] },
      { taskNumber: 26, code: "tables", name: "Таблицы и данные", description: "Практическая задача на анализ данных.", maxScore: 2, difficulty: "MEDIUM", tags: ["data", "second_part"] },
      { taskNumber: 27, code: "programming", name: "Программирование", description: "Задача на написание эффективного алгоритма.", maxScore: 4, difficulty: "HARD", tags: ["programming", "second_part"] }
    ]
  },
  {
    id: "demo-subject-english",
    code: "english",
    name: "Английский язык",
    taskTypes: [
      { taskNumber: 37, code: "written_response", name: "Развёрнутый письменный ответ", description: "Письменное высказывание по коммуникативной ситуации.", maxScore: 6, difficulty: "MEDIUM", tags: ["writing", "second_part"] },
      { taskNumber: 38, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание с анализом данных или мнений.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"] }
    ]
  },
  {
    id: "demo-subject-german",
    code: "german",
    name: "Немецкий язык",
    taskTypes: [
      { taskNumber: 37, code: "written_response", name: "Развёрнутый письменный ответ", description: "Письменное высказывание по коммуникативной ситуации.", maxScore: 6, difficulty: "MEDIUM", tags: ["writing", "second_part"] },
      { taskNumber: 38, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"] }
    ]
  },
  {
    id: "demo-subject-french",
    code: "french",
    name: "Французский язык",
    taskTypes: [
      { taskNumber: 37, code: "written_response", name: "Развёрнутый письменный ответ", description: "Письменное высказывание по коммуникативной ситуации.", maxScore: 6, difficulty: "MEDIUM", tags: ["writing", "second_part"] },
      { taskNumber: 38, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"] }
    ]
  },
  {
    id: "demo-subject-spanish",
    code: "spanish",
    name: "Испанский язык",
    taskTypes: [
      { taskNumber: 37, code: "written_response", name: "Развёрнутый письменный ответ", description: "Письменное высказывание по коммуникативной ситуации.", maxScore: 6, difficulty: "MEDIUM", tags: ["writing", "second_part"] },
      { taskNumber: 38, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"] }
    ]
  },
  {
    id: "demo-subject-chinese",
    code: "chinese",
    name: "Китайский язык",
    taskTypes: [
      { taskNumber: 29, code: "written_response", name: "Развёрнутый письменный ответ", description: "Письменное высказывание по коммуникативной ситуации.", maxScore: 8, difficulty: "MEDIUM", tags: ["writing", "second_part"] },
      { taskNumber: 30, code: "essay", name: "Развёрнутое высказывание", description: "Аргументированное письменное высказывание.", maxScore: 14, difficulty: "HARD", tags: ["essay", "writing", "second_part"] }
    ]
  }
];

function createTaskTypeId(subjectCode: string, code: string) {
  return `demo-type-${subjectCode}-${code}`;
}

function createTaskId(subjectCode: string, code: string) {
  return `demo-task-${subjectCode}-${code}`;
}

function createCriteria(maxScore: number): TaskCriterionDto[] {
  const criteria: TaskCriterionDto[] = [
    {
      id: `criterion-1-${maxScore}`,
      code: "K1",
      title: "Понимание условия",
      description: "Корректно выделена суть задания и выбран способ ответа.",
      maxScore: Math.max(1, Math.min(2, maxScore)),
      sortOrder: 1
    }
  ];

  if (maxScore >= 3) {
    criteria.push({
      id: `criterion-2-${maxScore}`,
      code: "K2",
      title: "Логика решения",
      description: "Ответ развёрнут, шаги согласованы между собой и опираются на теорию.",
      maxScore: Math.max(1, Math.min(2, maxScore - 1)),
      sortOrder: 2
    });
  }

  criteria.push({
    id: `criterion-3-${maxScore}`,
    code: "K3",
    title: "Итоговый ответ",
    description: "Финальный вывод сформулирован ясно и без противоречий.",
    maxScore: 1,
    sortOrder: 3
  });

  return criteria;
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
    const criteria = createCriteria(taskType.maxScore);

    return {
      id: createTaskId(subject.code, taskType.code),
      subjectId: subject.id,
      taskTypeId,
      year: 2025,
      sourceType: "demo_seed",
      sourceUrl: null,
      title: `${subject.name} · ${taskType.name}`,
      problemText: `Тренировочное задание по теме «${taskType.name}» предмета «${subject.name}». Этот пункт нужен, чтобы проверить выбор задания, загрузку решения и AI-проверку по соответствующему типу второй части.`,
      assetsJson: null,
      maxScore: taskType.maxScore,
      metaJson: {
        demo: true,
        subjectCode: subject.code
      },
      sourceStatus: "DEMO_SEED",
      isPublished: true,
      taskType: demoTaskTypes.find((item) => item.id === taskTypeId),
      subject: demoSubjects.find((item) => item.id === subject.id),
      criteria,
      referenceSolution: {
        id: `demo-reference-${subject.code}-${taskType.code}`,
        solutionText: `Эталонный ответ для темы «${taskType.name}»: структура ответа должна опираться на критерии K1–K3 и раскрывать ключевую логику решения.`,
        notes: subject.note ?? null,
        rubricJson: {
          demo: true,
          generatedFrom: taskType.code
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
