# EGEBot Mini App MVP

Telegram Mini App для подготовки ко второй части ЕГЭ. Пользователь проходит Telegram auth, выбирает предмет, собирает вариант или тренирует отдельный тип задания, загружает фото решения, отправляет попытку на AI-проверку и смотрит статистику. В проект встроен demo_seed, который можно позже заменить на verified seed без перестройки схемы.

## Стек

- Next.js App Router + TypeScript strict
- React + Tailwind CSS + React Query + Zustand
- PostgreSQL + Prisma
- Telegram WebApp auth с серверной валидацией `initData`
- Storage abstraction: local uploads / S3-compatible
- AI abstraction: OpenAI provider / mock provider
- Vitest для unit tests

## Что внутри

- Пользовательская часть: выбор предмета, выбор типа задания, генератор варианта, сессия решения, upload решения, AI result, statistics
- Admin section: task types, task bank, attempts
- Backend modules: auth, subjects, task types, tasks, variants, attempts, uploads, ai checks, statistics, admin
- Seed data: `demo_seed` предметы, типы заданий, задания, критерии, reference solutions

## Быстрый запуск

1. Скопируй `.env.example` в `.env`.
2. Подними PostgreSQL через Docker.
3. Установи зависимости.
4. Выполни Prisma migrate и seed.
5. Запусти dev server.

## Environment variables

Обязательные ключи уже перечислены в `.env.example`:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AI_PROVIDER`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBAPP_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- `STORAGE_MODE`
- `LOCAL_UPLOAD_DIR`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `ADMIN_TELEGRAM_IDS`

## Database

Поднять базу:

```bash
docker compose up -d
```

Выполнить миграции:

```bash
pnpm prisma:migrate
```

Заполнить demo seed:

```bash
pnpm prisma:seed
```

## Dev run

```bash
pnpm install
pnpm dev
```

Приложение откроется на `http://localhost:3000`.

## Production deploy

В репозитории уже подготовлены production-файлы:

- `Dockerfile`
- `docker-compose.prod.yml`
- `deploy/nginx.conf`
- `.env.production.example`
- `deploy/TELEGRAM_DEPLOY.md`
- `scripts/configure-telegram-mini-app.ts`

Быстрый сценарий:

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app pnpm prisma:deploy
docker compose -f docker-compose.prod.yml exec app pnpm telegram:configure
```

Healthcheck:

```text
/api/health
```

## Mock AI mode

Для локальной разработки можно оставить:

```env
AI_PROVIDER=mock
```

Тогда AI-check будет работать без вызова OpenAI API и возвращать валидный demo-результат.

## OpenAI mode

Чтобы включить реальную AI-проверку:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

## Telegram Mini App setup

1. Создай Telegram bot через BotFather.
2. Укажи `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBAPP_URL`.
3. Добавь Web App URL у бота.
4. Открывай приложение из Telegram, чтобы `initData` пришёл в Mini App.

Сервер валидирует `hash`, проверяет срок жизни `auth_date`, создаёт или обновляет пользователя и выпускает secure session cookie.

## Admin section

Админ-права определяются по `ADMIN_TELEGRAM_IDS`.

После входа admin pages доступны по адресам:

- `/admin/task-types`
- `/admin/tasks`
- `/admin/attempts`

### Import verified bank

На странице `/admin/tasks` есть импорт банка заданий из `.json` или `.csv`.

Поддерживаемый workflow:

- `demo_seed` остаётся для локальной демонстрации;
- реальные материалы загружаются отдельно через import;
- в import-файле у каждого задания есть `sourceStatus: VERIFIED | IMPORTED`;
- импорт делает upsert по `Subject`, `ExamTaskType` и `TaskBankItem`, затем полностью обновляет критерии и эталонное решение.

Примеры файлов:

- `public/examples/verified-bank.sample.json`
- `public/examples/verified-bank.sample.csv`

JSON-формат:

```json
{
  "formatVersion": 1,
  "tasks": [
    {
      "subjectCode": "history",
      "subjectName": "История",
      "taskTypeCode": "historical-essay",
      "taskNumber": 25,
      "taskTypeName": "Историческое сочинение",
      "taskTypeDescription": "Развернутый ответ по историческому периоду",
      "taskTypeMaxScore": 12,
      "taskDifficulty": "HARD",
      "tags": ["verified"],
      "sourceStatus": "VERIFIED",
      "year": 2025,
      "sourceType": "verified_import",
      "sourceUrl": "https://example.org/task",
      "title": "verified task",
      "problemText": "Текст задания",
      "assetsJson": null,
      "maxScore": 12,
      "metaJson": null,
      "isPublished": true,
      "criteria": [
        {
          "code": "K1",
          "title": "Критерий",
          "description": "Описание критерия",
          "maxScore": 4,
          "sortOrder": 1
        }
      ],
      "referenceSolution": {
        "solutionText": "Эталонное решение",
        "notes": null,
        "rubricJson": null
      }
    }
  ]
}
```

CSV-формат:

- одна строка = одно задание;
- поля `criteriaJson`, `assetsJson`, `metaJson`, `rubricJson` передаются JSON-строкой;
- `tags` разделяются через `|`.

## Storage

По умолчанию используется local storage в `public/uploads`.

Для S3-compatible режима:

```env
STORAGE_MODE=s3
S3_ENDPOINT=...
S3_REGION=...
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

## Тесты

```bash
pnpm test
```

Покрыты базовые unit tests для:

- Telegram initData validation
- AI response validation
- Variant generation logic
- Score aggregation logic
