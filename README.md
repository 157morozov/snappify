# Snappify

Аналог POV для мероприятий: событие, QR/ссылка для гостей, лимит кадров, отложенное открытие галереи.

## Стек
- **Client:** React + Vite + React Router v6
- **Server:** FastAPI + SQLite

---

## 1) Установка и запуск Client

```bash
cd client
npm install
npm run dev
```

Client по умолчанию стартует на `http://localhost:5173`.

### Переменные окружения Client
Создайте `client/.env`:

```env
VITE_API_BASE=http://localhost:8000/api
```

---

## 2) Установка и запуск Server

```bash
cd server
python -m venv .venv
```

### Windows (PowerShell)
```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

### Linux/macOS
```bash
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

Server стартует на `http://localhost:8000`.

### Переменные окружения Server
Скопируйте `.env.example` в `.env` и настройте:

```env
HOST=0.0.0.0
PORT=8000
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_google_app_password
```

> Для Gmail нужен **App Password** (2FA включена).

---

## 3) Решение вашей ошибки с `pip` (Windows)

У вас сломан launcher `pip.exe` (он ссылается на старый путь `Flashback\\...`).

Используйте **только** такой формат команд, чтобы обойти сломанный `pip.exe`:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Если не помогает — пересоздайте venv:

```powershell
cd server
rmdir /s /q .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

После этого ошибки:
- `Form data requires "python-multipart" to be installed`
- `pip launcher fatal error`

должны исчезнуть.

---

## 4) Проверка запуска

1. Откройте `http://localhost:8000/docs` — Swagger FastAPI.
2. Откройте `http://localhost:5173` — frontend.
3. Зарегистрируйтесь, подтвердите email кодом, создайте событие.
