import { Prisma, PrismaClient, SourceStatus, TaskDifficulty } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTask(input: {
  subjectCode: string;
  taskTypeCode: string;
  title: string;
  problemText: string;
  maxScore: number;
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
    rubricJson?: unknown;
  };
  year?: number;
}) {
  const subject = await prisma.subject.findUniqueOrThrow({
    where: { code: input.subjectCode }
  });

  const taskType = await prisma.examTaskType.findFirstOrThrow({
    where: {
      subjectId: subject.id,
      code: input.taskTypeCode
    }
  });

  const task = await prisma.taskBankItem.create({
    data: {
      subjectId: subject.id,
      taskTypeId: taskType.id,
      year: input.year ?? 2025,
      sourceType: "demo_seed",
      title: input.title,
      problemText: input.problemText,
      maxScore: input.maxScore,
      sourceStatus: SourceStatus.DEMO_SEED,
      isPublished: true
    }
  });

  await prisma.taskCriterion.createMany({
    data: input.criteria.map((criterion) => ({
      taskBankItemId: task.id,
      ...criterion
    }))
  });

  await prisma.referenceSolution.create({
    data: {
      taskBankItemId: task.id,
      solutionText: input.referenceSolution.solutionText,
      notes: input.referenceSolution.notes ?? null,
      rubricJson: input.referenceSolution.rubricJson ?? Prisma.JsonNull
    }
  });
}

async function main() {
  await prisma.criterionScore.deleteMany();
  await prisma.aICheck.deleteMany();
  await prisma.attemptFile.deleteMany();
  await prisma.userAttempt.deleteMany();
  await prisma.variantTask.deleteMany();
  await prisma.generatedVariant.deleteMany();
  await prisma.referenceSolution.deleteMany();
  await prisma.taskCriterion.deleteMany();
  await prisma.taskBankItem.deleteMany();
  await prisma.examTaskType.deleteMany();
  await prisma.userStatistics.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const math = await prisma.subject.create({
    data: {
      code: "math_profile",
      name: "Математика профиль",
      isActive: true
    }
  });

  const russian = await prisma.subject.create({
    data: {
      code: "russian",
      name: "Русский язык",
      isActive: true
    }
  });

  const social = await prisma.subject.create({
    data: {
      code: "social",
      name: "Обществознание",
      isActive: true
    }
  });

  await prisma.examTaskType.createMany({
    data: [
      {
        subjectId: math.id,
        taskNumber: 13,
        code: "stereometry",
        name: "Стереометрия",
        description: "Доказательство и вычисления в пространстве",
        maxScore: 3,
        difficulty: TaskDifficulty.HARD,
        tags: ["geometry", "proof", "demo_seed"],
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      },
      {
        subjectId: math.id,
        taskNumber: 15,
        code: "inequality",
        name: "Неравенство",
        description: "Рациональные и логарифмические неравенства",
        maxScore: 2,
        difficulty: TaskDifficulty.HARD,
        tags: ["algebra", "demo_seed"],
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      },
      {
        subjectId: russian.id,
        taskNumber: 27,
        code: "essay",
        name: "Сочинение-рассуждение",
        description: "Аргументация и комментарий к проблеме текста",
        maxScore: 6,
        difficulty: TaskDifficulty.HARD,
        tags: ["writing", "essay", "demo_seed"],
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      },
      {
        subjectId: social.id,
        taskNumber: 24,
        code: "plan",
        name: "Сложный план",
        description: "Развёрнутый план по обществознанию",
        maxScore: 4,
        difficulty: TaskDifficulty.MEDIUM,
        tags: ["structure", "demo_seed"],
        sourceStatus: SourceStatus.DEMO_SEED,
        isActive: true
      }
    ]
  });

  await seedTask({
    subjectCode: "math_profile",
    taskTypeCode: "stereometry",
    title: "demo_seed · Математика · Стереометрия",
    problemText:
      "В правильной треугольной призме ABC A1B1C1 найдите угол между прямыми AB1 и BC1. Обоснуйте решение и запишите вычисления последовательно.",
    maxScore: 3,
    criteria: [
      {
        code: "K1",
        title: "Построение и выбор метода",
        description: "Корректно введены обозначения и выбран способ нахождения угла.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Вычисления",
        description: "Верно выполнены вычисления длин и косинуса угла.",
        maxScore: 1,
        sortOrder: 2
      },
      {
        code: "K3",
        title: "Ответ",
        description: "Получен корректный ответ с пояснениями.",
        maxScore: 1,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      solutionText:
        "Рассматриваем координатную модель призмы, выражаем направляющие векторы AB1 и BC1, далее используем скалярное произведение. После упрощения получаем значение косинуса и находим угол.",
      notes: "demo_seed reference",
      rubricJson: {
        expectedStrategy: "vector_method"
      }
    }
  });

  await seedTask({
    subjectCode: "math_profile",
    taskTypeCode: "inequality",
    title: "demo_seed · Математика · Неравенство",
    problemText:
      "Решите неравенство log2(x + 3) + log2(5 - x) >= 2 и укажите промежутки, удовлетворяющие ОДЗ.",
    maxScore: 2,
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
        "По ОДЗ x > -3 и x < 5. Складываем логарифмы, получаем log2((x+3)(5-x)) >= 2, далее решаем квадратное неравенство и пересекаем ответ с ОДЗ."
    }
  });

  await seedTask({
    subjectCode: "russian",
    taskTypeCode: "essay",
    title: "demo_seed · Русский язык · Сочинение",
    problemText:
      "Напишите сочинение-рассуждение по тексту о личной ответственности человека. Сформулируйте проблему, прокомментируйте её и обозначьте позицию автора.",
    maxScore: 6,
    criteria: [
      {
        code: "K1",
        title: "Формулировка проблемы",
        description: "Проблема исходного текста сформулирована корректно.",
        maxScore: 1,
        sortOrder: 1
      },
      {
        code: "K2",
        title: "Комментарий к проблеме",
        description: "Даны два примера-иллюстрации и связь между ними.",
        maxScore: 3,
        sortOrder: 2
      },
      {
        code: "K3",
        title: "Позиция автора и своё отношение",
        description: "Позиция автора определена, приведено аргументированное мнение ученика.",
        maxScore: 2,
        sortOrder: 3
      }
    ],
    referenceSolution: {
      solutionText:
        "Проблема текста связана с тем, как человек принимает ответственность за свои решения. В комментарии важно показать два смысловых фрагмента и объяснить их связь. Автор убеждает читателя, что зрелость проявляется в способности отвечать за последствия поступков.",
      notes: "demo_seed essay rubric"
    }
  });

  await seedTask({
    subjectCode: "social",
    taskTypeCode: "plan",
    title: "demo_seed · Обществознание · Сложный план",
    problemText:
      "Составьте сложный план по теме 'Социальный контроль'. План должен содержать не менее трёх пунктов, два из которых детализированы в подпунктах.",
    maxScore: 4,
    criteria: [
      {
        code: "K1",
        title: "Корректность структуры",
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
  });

  console.log("Demo seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
