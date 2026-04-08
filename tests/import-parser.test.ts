import { describe, expect, it } from "vitest";

import { parseImportCsv, parseImportJson } from "@/lib/admin/import-parser";

describe("import parser", () => {
  it("parses verified task bank JSON", () => {
    const payload = parseImportJson(
      JSON.stringify({
        formatVersion: 1,
        tasks: [
          {
            subjectCode: "physics",
            subjectName: "Физика",
            taskTypeCode: "detailed-answer",
            taskNumber: 24,
            taskTypeName: "Развернутый ответ",
            taskTypeDescription: "Подробное решение задачи",
            taskTypeMaxScore: 3,
            taskDifficulty: "HARD",
            tags: ["verified"],
            sourceStatus: "VERIFIED",
            year: 2025,
            sourceType: "verified_import",
            sourceUrl: "https://example.org/task",
            title: "verified task",
            problemText: "Решите задачу",
            assetsJson: null,
            maxScore: 3,
            metaJson: null,
            isPublished: true,
            criteria: [
              {
                code: "K1",
                title: "Логика",
                description: "Корректный ход решения",
                maxScore: 3,
                sortOrder: 1
              }
            ],
            referenceSolution: {
              solutionText: "Эталонное решение",
              notes: null,
              rubricJson: null
            }
          }
        ]
      })
    );

    expect(payload.tasks[0]?.subjectCode).toBe("physics");
    expect(payload.tasks[0]?.sourceStatus).toBe("VERIFIED");
  });

  it("parses verified task bank CSV", () => {
    const csv = [
      "subjectCode,subjectName,taskTypeCode,taskNumber,taskTypeName,taskTypeDescription,taskTypeMaxScore,taskDifficulty,tags,sourceStatus,year,sourceType,sourceUrl,title,problemText,assetsJson,maxScore,metaJson,isPublished,criteriaJson,referenceSolutionText,referenceNotes,rubricJson",
      'informatics,Информатика,programming,27,Программирование,Решение задачи на код,4,HARD,verified|coding,VERIFIED,2025,verified_import,https://example.org/27,verified csv task,"Напишите программу",,4,,true,"[{""code"":""K1"",""title"":""Алгоритм"",""description"":""Корректный алгоритм"",""maxScore"":2,""sortOrder"":1}]","Эталон","notes",'
    ].join("\n");

    const payload = parseImportCsv(csv);

    expect(payload.tasks[0]?.taskTypeCode).toBe("programming");
    expect(payload.tasks[0]?.criteria).toHaveLength(1);
  });
});
