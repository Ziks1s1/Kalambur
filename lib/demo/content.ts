import type { ExamTaskTypeDto, SubjectDto } from "@/schemas/subject";
import type { TaskBankItemDto } from "@/schemas/task";

type DemoTask = TaskBankItemDto;

const mathSubjectId = "demo-subject-math";
const russianSubjectId = "demo-subject-russian";
const socialSubjectId = "demo-subject-social";

const stereometryTypeId = "demo-type-stereometry";
const inequalityTypeId = "demo-type-inequality";
const essayTypeId = "demo-type-essay";
const planTypeId = "demo-type-plan";

export const demoSubjects: SubjectDto[] = [
  { id: mathSubjectId, code: "math_profile", name: "Математика профиль", isActive: true },
  { id: russianSubjectId, code: "russian", name: "Русский язык", isActive: true },
  { id: socialSubjectId, code: "social", name: "Обществознание", isActive: true }
];

export const demoTaskTypes: ExamTaskTypeDto[] = [
  {
    id: stereometryTypeId,
    subjectId: mathSubjectId,
    taskNumber: 13,
    code: "stereometry",
    name: "Стереометрия",
    description: "Задачи на доказательство и вычисления в пространстве.",
    maxScore: 3,
    difficulty: "HARD",
    tags: ["geometry", "proof", "demo_seed"],
    sourceStatus: "DEMO_SEED",
    isActive: true
  },
  {
    id: inequalityTypeId,
    subjectId: mathSubjectId,
    taskNumber: 15,
    code: "inequality",
    name: "Неравенство",
    description: "Рациональные и логарифмические неравенства второй части.",
    maxScore: 2,
    difficulty: "HARD",
    tags: ["algebra", "logarithm", "demo_seed"],
    sourceStatus: "DEMO_SEED",
    isActive: true
  },
  {
    id: essayTypeId,
    subjectId: russianSubjectId,
    taskNumber: 27,
    code: "essay",
    name: "Сочинение-рассуждение",
    description: "Формулировка проблемы, комментарий, позиция автора и аргументация.",
    maxScore: 6,
    difficulty: "HARD",
    tags: ["writing", "essay", "demo_seed"],
    sourceStatus: "DEMO_SEED",
    isActive: true
  },
  {
    id: planTypeId,
    subjectId: socialSubjectId,
    taskNumber: 24,
    code: "plan",
    name: "Сложный план",
    description: "Развёрнутый план по обществоведческой теме.",
    maxScore: 4,
    difficulty: "MEDIUM",
    tags: ["structure", "plan", "demo_seed"],
    sourceStatus: "DEMO_SEED",
    isActive: true
  }
];

export const demoTasks: DemoTask[] = [
  {
    id: "demo-task-stereometry",
    subjectId: mathSubjectId,
    taskTypeId: stereometryTypeId,
    year: 2025,
    sourceType: "demo_seed",
    sourceUrl: null,
    title: "demo_seed · Математика · Стереометрия",
    problemText:
      "В правильной треугольной призме ABCA1B1C1 найдите угол между прямыми AB1 и BC1. Обоснуйте решение и последовательно запишите вычисления.",
    assetsJson: null,
    maxScore: 3,
    metaJson: null,
    sourceStatus: "DEMO_SEED",
    isPublished: true,
    taskType: demoTaskTypes.find((item) => item.id === stereometryTypeId),
    subject: demoSubjects.find((item) => item.id === mathSubjectId),
    criteria: [
      {
        id: "demo-criterion-stereo-k1",
        code: "K1",
        title: "Построение модели",
        description: "Корректно введены обозначения и выбран способ решения задачи.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        id: "demo-criterion-stereo-k2",
        code: "K2",
        title: "Вычисления",
        description: "Правильно найдены длины и выполнены преобразования для вычисления угла.",
        maxScore: 1,
        sortOrder: 2
      },
      {
        id: "demo-criterion-stereo-k3",
        code: "K3",
        title: "Ответ",
        description: "Получен верный ответ и оформлено пояснение к результату.",
        maxScore: 1,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      id: "demo-reference-stereometry",
      solutionText:
        "Удобно ввести координаты вершин призмы, записать направляющие векторы AB1 и BC1, затем воспользоваться формулой скалярного произведения. После вычислений получаем косинус угла и находим сам угол между прямыми.",
      notes: "demo_seed reference",
      rubricJson: { expectedStrategy: "vector_method" }
    }
  },
  {
    id: "demo-task-inequality",
    subjectId: mathSubjectId,
    taskTypeId: inequalityTypeId,
    year: 2025,
    sourceType: "demo_seed",
    sourceUrl: null,
    title: "demo_seed · Математика · Неравенство",
    problemText: "Решите неравенство log2(x + 3) + log2(5 - x) >= 2 и укажите промежутки, удовлетворяющие ОДЗ.",
    assetsJson: null,
    maxScore: 2,
    metaJson: null,
    sourceStatus: "DEMO_SEED",
    isPublished: true,
    taskType: demoTaskTypes.find((item) => item.id === inequalityTypeId),
    subject: demoSubjects.find((item) => item.id === mathSubjectId),
    criteria: [
      {
        id: "demo-criterion-ineq-k1",
        code: "K1",
        title: "ОДЗ",
        description: "Корректно выписаны ограничения на переменную.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        id: "demo-criterion-ineq-k2",
        code: "K2",
        title: "Решение неравенства",
        description: "Неравенство сведено к алгебраическому виду и решено без ошибок.",
        maxScore: 1,
        sortOrder: 2
      }
    ],
    referenceSolution: {
      id: "demo-reference-inequality",
      solutionText:
        "Сначала задаём ОДЗ: x > -3 и x < 5. Складываем логарифмы, получаем log2((x + 3)(5 - x)) >= 2. Затем решаем полученное квадратное неравенство и пересекаем результат с ОДЗ.",
      notes: null,
      rubricJson: null
    }
  },
  {
    id: "demo-task-essay",
    subjectId: russianSubjectId,
    taskTypeId: essayTypeId,
    year: 2025,
    sourceType: "demo_seed",
    sourceUrl: null,
    title: "demo_seed · Русский язык · Сочинение",
    problemText:
      "Напишите сочинение-рассуждение по тексту о личной ответственности человека. Сформулируйте проблему, прокомментируйте её, обозначьте позицию автора и выразите собственное отношение.",
    assetsJson: null,
    maxScore: 6,
    metaJson: null,
    sourceStatus: "DEMO_SEED",
    isPublished: true,
    taskType: demoTaskTypes.find((item) => item.id === essayTypeId),
    subject: demoSubjects.find((item) => item.id === russianSubjectId),
    criteria: [
      {
        id: "demo-criterion-essay-k1",
        code: "K1",
        title: "Проблема исходного текста",
        description: "Проблема текста сформулирована корректно.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        id: "demo-criterion-essay-k2",
        code: "K2",
        title: "Комментарий к проблеме",
        description: "Приведены два примера-иллюстрации и объяснена связь между ними.",
        maxScore: 3,
        sortOrder: 2
      },
      {
        id: "demo-criterion-essay-k3",
        code: "K3",
        title: "Позиция автора и мнение ученика",
        description: "Позиция автора определена, а отношение ученика аргументировано.",
        maxScore: 2,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      id: "demo-reference-essay",
      solutionText:
        "Проблема текста связана с тем, как человек принимает ответственность за собственные решения. В комментарии важно показать два смысловых фрагмента текста и объяснить их связь. Автор убеждает читателя, что зрелость проявляется в способности отвечать за последствия поступков.",
      notes: "demo_seed essay reference",
      rubricJson: null
    }
  },
  {
    id: "demo-task-plan",
    subjectId: socialSubjectId,
    taskTypeId: planTypeId,
    year: 2025,
    sourceType: "demo_seed",
    sourceUrl: null,
    title: "demo_seed · Обществознание · Сложный план",
    problemText:
      "Составьте сложный план по теме «Социальный контроль». План должен содержать не менее трёх пунктов, два из которых детализированы в подпунктах.",
    assetsJson: null,
    maxScore: 4,
    metaJson: null,
    sourceStatus: "DEMO_SEED",
    isPublished: true,
    taskType: demoTaskTypes.find((item) => item.id === planTypeId),
    subject: demoSubjects.find((item) => item.id === socialSubjectId),
    criteria: [
      {
        id: "demo-criterion-plan-k1",
        code: "K1",
        title: "Структура плана",
        description: "Соблюдены требования к сложному плану.",
        maxScore: 2,
        sortOrder: 1
      },
      {
        id: "demo-criterion-plan-k2",
        code: "K2",
        title: "Содержательная полнота",
        description: "План раскрывает основные аспекты темы.",
        maxScore: 2,
        sortOrder: 2
      }
    ],
    referenceSolution: {
      id: "demo-reference-plan",
      solutionText:
        "1. Понятие социального контроля. 2. Формы социального контроля: а) внутренний; б) внешний. 3. Социальные санкции: а) формальные; б) неформальные. 4. Значение социального контроля для общества.",
      notes: null,
      rubricJson: null
    }
  }
];

export function getDemoTaskTypesBySubjectId(subjectId: string) {
  return demoTaskTypes.filter((item) => item.subjectId === subjectId);
}

export function getDemoTasksByTaskTypeId(taskTypeId: string) {
  return demoTasks.filter((item) => item.taskTypeId === taskTypeId);
}

export function getDemoTaskById(taskId: string) {
  return demoTasks.find((item) => item.id === taskId) ?? null;
}
