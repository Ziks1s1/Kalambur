import { Prisma, SourceStatus, TaskDifficulty } from "@prisma/client";

import { db } from "@/lib/db";

type DemoTaskSeed = {
  subject: {
    code: string;
    name: string;
  };
  taskType: {
    taskNumber: number;
    code: string;
    name: string;
    description: string;
    maxScore: number;
    difficulty: TaskDifficulty;
    tags: string[];
  };
  task: {
    year: number;
    title: string;
    problemText: string;
    maxScore: number;
    sourceType: string;
  };
  criteria: Array<{
    code: string;
    title: string;
    description: string;
    maxScore: number;
    sortOrder: number;
  }>;
  referenceSolution: {
    solutionText: string;
    notes?: string;
    rubricJson?: Prisma.InputJsonValue;
  };
};

const demoTasks: DemoTaskSeed[] = [
  {
    subject: { code: "math_profile", name: "Математика профиль" },
    taskType: {
      taskNumber: 13,
      code: "stereometry",
      name: "Стереометрия",
      description: "Задачи на доказательство и вычисления в пространстве.",
      maxScore: 3,
      difficulty: TaskDifficulty.HARD,
      tags: ["geometry", "proof", "demo_seed"]
    },
    task: {
      year: 2025,
      title: "demo_seed · Математика · Стереометрия",
      problemText:
        "В правильной треугольной призме ABCA1B1C1 найдите угол между прямыми AB1 и BC1. Обоснуйте решение и последовательно запишите вычисления.",
      maxScore: 3,
      sourceType: "demo_seed"
    },
    criteria: [
      {
        code: "K1",
        title: "Построение модели",
        description: "Корректно введены обозначения и выбран способ решения задачи.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Вычисления",
        description: "Правильно найдены длины и выполнены преобразования для вычисления угла.",
        maxScore: 1,
        sortOrder: 2
      },
      {
        code: "K3",
        title: "Ответ",
        description: "Получен верный ответ и оформлено пояснение к результату.",
        maxScore: 1,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      solutionText:
        "Удобно ввести координаты вершин призмы, записать направляющие векторы AB1 и BC1, затем воспользоваться формулой скалярного произведения. После вычислений получаем косинус угла и находим сам угол между прямыми.",
      notes: "demo_seed reference",
      rubricJson: { expectedStrategy: "vector_method" }
    }
  },
  {
    subject: { code: "math_profile", name: "Математика профиль" },
    taskType: {
      taskNumber: 15,
      code: "inequality",
      name: "Неравенство",
      description: "Рациональные и логарифмические неравенства второй части.",
      maxScore: 2,
      difficulty: TaskDifficulty.HARD,
      tags: ["algebra", "logarithm", "demo_seed"]
    },
    task: {
      year: 2025,
      title: "demo_seed · Математика · Неравенство",
      problemText: "Решите неравенство log2(x + 3) + log2(5 - x) >= 2 и укажите промежутки, удовлетворяющие ОДЗ.",
      maxScore: 2,
      sourceType: "demo_seed"
    },
    criteria: [
      {
        code: "K1",
        title: "ОДЗ",
        description: "Корректно выписаны ограничения на переменную.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Решение неравенства",
        description: "Неравенство сведено к алгебраическому виду и решено без ошибок.",
        maxScore: 1,
        sortOrder: 2
      }
    ],
    referenceSolution: {
      solutionText:
        "Сначала задаём ОДЗ: x > -3 и x < 5. Складываем логарифмы, получаем log2((x + 3)(5 - x)) >= 2. Затем решаем полученное квадратное неравенство и пересекаем результат с ОДЗ."
    }
  },
  {
    subject: { code: "russian", name: "Русский язык" },
    taskType: {
      taskNumber: 27,
      code: "essay",
      name: "Сочинение-рассуждение",
      description: "Формулировка проблемы, комментарий, позиция автора и аргументация.",
      maxScore: 6,
      difficulty: TaskDifficulty.HARD,
      tags: ["writing", "essay", "demo_seed"]
    },
    task: {
      year: 2025,
      title: "demo_seed · Русский язык · Сочинение",
      problemText:
        "Напишите сочинение-рассуждение по тексту о личной ответственности человека. Сформулируйте проблему, прокомментируйте её, обозначьте позицию автора и выразите собственное отношение.",
      maxScore: 6,
      sourceType: "demo_seed"
    },
    criteria: [
      {
        code: "K1",
        title: "Проблема исходного текста",
        description: "Проблема текста сформулирована корректно.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Комментарий к проблеме",
        description: "Приведены два примера-иллюстрации и объяснена связь между ними.",
        maxScore: 3,
        sortOrder: 2
      },
      {
        code: "K3",
        title: "Позиция автора и мнение ученика",
        description: "Позиция автора определена, а отношение ученика аргументировано.",
        maxScore: 2,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      solutionText:
        "Проблема текста связана с тем, как человек принимает ответственность за собственные решения. В комментарии важно показать два смысловых фрагмента текста и объяснить их связь. Автор убеждает читателя, что зрелость проявляется в способности отвечать за последствия поступков.",
      notes: "demo_seed essay reference"
    }
  },
  {
    subject: { code: "social", name: "Обществознание" },
    taskType: {
      taskNumber: 24,
      code: "plan",
      name: "Сложный план",
      description: "Развёрнутый план по обществоведческой теме.",
      maxScore: 4,
      difficulty: TaskDifficulty.MEDIUM,
      tags: ["structure", "plan", "demo_seed"]
    },
    task: {
      year: 2025,
      title: "demo_seed · Обществознание · Сложный план",
      problemText:
        "Составьте сложный план по теме «Социальный контроль». План должен содержать не менее трёх пунктов, два из которых детализированы в подпунктах.",
      maxScore: 4,
      sourceType: "demo_seed"
    },
    criteria: [
      {
        code: "K1",
        title: "Структура плана",
        description: "Соблюдены требования к сложному плану.",
        maxScore: 2,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Содержательная полнота",
        description: "План раскрывает основные аспекты темы.",
        maxScore: 2,
        sortOrder: 2
      }
    ],
    referenceSolution: {
      solutionText:
        "1. Понятие социального контроля. 2. Формы социального контроля: а) внутренний; б) внешний. 3. Социальные санкции: а) формальные; б) неформальные. 4. Значение социального контроля для общества."
    }
  }
];

let bootstrapPromise: Promise<void> | null = null;

async function upsertDemoTask(item: DemoTaskSeed) {
  const subject = await db.subject.upsert({
    where: { code: item.subject.code },
    update: {
      name: item.subject.name,
      isActive: true
    },
    create: {
      code: item.subject.code,
      name: item.subject.name,
      isActive: true
    }
  });

  const taskType = await db.examTaskType.upsert({
    where: {
      subjectId_code: {
        subjectId: subject.id,
        code: item.taskType.code
      }
    },
    update: {
      taskNumber: item.taskType.taskNumber,
      name: item.taskType.name,
      description: item.taskType.description,
      maxScore: item.taskType.maxScore,
      difficulty: item.taskType.difficulty,
      tags: item.taskType.tags,
      sourceStatus: SourceStatus.DEMO_SEED,
      isActive: true
    },
    create: {
      subjectId: subject.id,
      taskNumber: item.taskType.taskNumber,
      code: item.taskType.code,
      name: item.taskType.name,
      description: item.taskType.description,
      maxScore: item.taskType.maxScore,
      difficulty: item.taskType.difficulty,
      tags: item.taskType.tags,
      sourceStatus: SourceStatus.DEMO_SEED,
      isActive: true
    }
  });

  const existingTask = await db.taskBankItem.findFirst({
    where: {
      subjectId: subject.id,
      taskTypeId: taskType.id,
      title: item.task.title,
      year: item.task.year
    }
  });

  const task = existingTask
    ? await db.taskBankItem.update({
        where: { id: existingTask.id },
        data: {
          sourceType: item.task.sourceType,
          title: item.task.title,
          problemText: item.task.problemText,
          maxScore: item.task.maxScore,
          sourceStatus: SourceStatus.DEMO_SEED,
          isPublished: true
        }
      })
    : await db.taskBankItem.create({
        data: {
          subjectId: subject.id,
          taskTypeId: taskType.id,
          year: item.task.year,
          sourceType: item.task.sourceType,
          title: item.task.title,
          problemText: item.task.problemText,
          maxScore: item.task.maxScore,
          sourceStatus: SourceStatus.DEMO_SEED,
          isPublished: true
        }
      });

  await db.taskCriterion.deleteMany({
    where: {
      taskBankItemId: task.id
    }
  });

  await db.taskCriterion.createMany({
    data: item.criteria.map((criterion) => ({
      taskBankItemId: task.id,
      code: criterion.code,
      title: criterion.title,
      description: criterion.description,
      maxScore: criterion.maxScore,
      sortOrder: criterion.sortOrder
    }))
  });

  await db.referenceSolution.upsert({
    where: {
      taskBankItemId: task.id
    },
    update: {
      solutionText: item.referenceSolution.solutionText,
      notes: item.referenceSolution.notes ?? null,
      rubricJson: item.referenceSolution.rubricJson ?? Prisma.JsonNull
    },
    create: {
      taskBankItemId: task.id,
      solutionText: item.referenceSolution.solutionText,
      notes: item.referenceSolution.notes ?? null,
      rubricJson: item.referenceSolution.rubricJson ?? Prisma.JsonNull
    }
  });
}

export class DemoBootstrapService {
  async ensureDemoData() {
    const subjectCount = await db.subject.count();

    if (subjectCount > 0) {
      return;
    }

    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        for (const item of demoTasks) {
          await upsertDemoTask(item);
        }
      })().finally(() => {
        bootstrapPromise = null;
      });
    }

    await bootstrapPromise;
  }
}

export const demoBootstrapService = new DemoBootstrapService();
