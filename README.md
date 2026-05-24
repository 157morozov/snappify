# Snappify

Приложение для мероприятий в стиле POV: лимит кадров, вход гостей по коду/QR, веб-камера, общая галерея и отложенное открытие фото.

## Стек
- **Client:** React + Vite + React Router v6
- **Server:** FastAPI + SQLite

## Быстрый старт
### 1) Server
```bash
cd server
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

API: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

### 2) Client
```bash
cd client
npm install
npm run dev
```
Client: `http://localhost:5173`

Создайте `client/.env`:
```env
VITE_API_BASE=http://localhost:8000/api
```

## Авторизация и подтверждение
Используется локальный flow подтверждения **ключа доступа** (без email):
1. Регистрация: имя, логин, пароль.
2. На `/auth/verify` подтверждаете код.
3. После подтверждения выполняется вход в аккаунт.

## Основные возможности
- Создание мероприятия с датой начала/окончания, лимитом кадров, фильтром и режимом показа фото.
- Вход гостя по коду и по QR (`/event/join/qr`).
- Съемка фото прямо из веб-приложения (`/event/:code/camera`).
- Галерея мероприятия:
  - `instant` — сразу,
  - `delayed` — после `end_at` или `reveal_at`.

## Ограничения по статусу
- Фото можно добавлять только когда мероприятие **в процессе**.
- До старта и после завершения загрузка фото запрещена.
- Присоединение к мероприятию по коду доступно при любом статусе.

## Безопасность
- Пароли: PBKDF2 + соль.
- Сессии: токен + срок действия.
- Upload: ограничение 10MB, проверка расширения и MIME (`image/*`).
- Валидация диапазона дат мероприятия.
- Базовые security headers (`nosniff`, `DENY`, `Referrer-Policy`).

## Локальная сеть (телефон в той же Wi‑Fi)
1. Узнайте IP компьютера (`ipconfig` / `ifconfig` / `ip a`).
2. Запустите backend на `HOST=0.0.0.0`.
3. Запустите frontend: `npm run dev:host`.
4. В `client/.env` укажите:
```env
VITE_API_BASE=http://<IP_ПК>:8000/api
```
5. Откройте на телефоне: `http://<IP_ПК>:5173`.
