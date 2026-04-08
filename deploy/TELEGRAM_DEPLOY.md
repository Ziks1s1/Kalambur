# Telegram Mini App deploy checklist

## 1. Подготовить домен

- Создай домен или поддомен, например `app.example.com`.
- Настрой DNS на сервер, где будет работать приложение.
- Убедись, что итоговый URL будет доступен по HTTPS.

## 2. Подготовить production env

```bash
cp .env.production.example .env.production
```

Заполни:

- `DATABASE_URL`
- `SESSION_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBAPP_URL`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`
- S3-переменные
- `ADMIN_TELEGRAM_IDS`

Важно:

- `TELEGRAM_WEBAPP_URL` и `NEXT_PUBLIC_APP_URL` должны совпадать с реальным HTTPS-адресом приложения.
- Для production используй `STORAGE_MODE=s3`.

## 3. Поднять приложение

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 4. Применить миграции

```bash
docker compose -f docker-compose.prod.yml exec app pnpm prisma:deploy
```

## 5. Выполнить seed при первом запуске

```bash
docker compose -f docker-compose.prod.yml exec app pnpm prisma:seed
```

Если не хочешь demo-данные в production, пропусти seed и загрузи verified банк через admin import.

## 6. Проверить health endpoint

Открой:

```text
https://your-domain/api/health
```

Ожидается JSON со статусом `ok`.

## 7. Настроить Mini App у бота

После того как приложение уже доступно извне:

```bash
docker compose -f docker-compose.prod.yml exec app pnpm telegram:configure
```

Скрипт:

- выставит menu button типа `web_app`;
- укажет `TELEGRAM_WEBAPP_URL`;
- добавит команду `/start`.

## 8. Что сделать в BotFather

Даже после скрипта стоит проверить в `@BotFather`:

- что у бота корректный username;
- что Web App URL совпадает с production URL;
- что у бота включена нужная кнопка меню.

## 9. Проверка внутри Telegram

1. Открой диалог с ботом.
2. Нажми кнопку меню `Открыть тренажёр`.
3. Убедись, что Mini App открывается внутри Telegram.
4. Пройди auth и открой список предметов.

## 10. Post-deploy smoke test

Проверь:

- `/api/health`
- Telegram auth
- `/api/subjects`
- генерацию варианта
- upload изображения
- AI-check
- `/statistics`
- `/admin/tasks`

## 11. Обновление приложения

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app pnpm prisma:deploy
```
