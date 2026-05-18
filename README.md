# Snappify

Аналог POV для мероприятий: событие, QR/ссылка для гостей, лимит кадров, отложенное открытие галереи.

## Стек
- **Client:** React + Vite + React Router v6
- **Server:** FastAPI + SQLite

## 1) Client (установка и запуск)
```bash
cd client
npm install
npm run dev
```

Для запуска в локальной сети (чтобы открыть с телефона):
```bash
npm run dev:host
```

По умолчанию frontend: `http://localhost:5173`.

Создайте `client/.env`:
```env
VITE_API_BASE=http://localhost:8000/api
```

Если тестируете с телефона, укажите IP компьютера:
```env
VITE_API_BASE=http://192.168.1.100:8000/api
```

## 2) Server (установка и запуск)
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

Server: `http://localhost:8000`

Swagger:
- `http://localhost:8000/docs` (основной)
- `http://localhost:8000/doc` (добавлен редирект на `/docs`)

### Переменные окружения Server
Скопируйте `.env.example` в `.env`:
```env
HOST=0.0.0.0
PORT=8000
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_google_app_password
```

## 3) Как правильно настроить Gmail для отправки писем
1. Войдите в Google аккаунт.
2. Включите **2-Step Verification (2FA)**: Google Account → Security.
3. Перейдите в **App passwords**.
4. Создайте пароль приложения (например, `Snappify Mail`).
5. Скопируйте 16-символьный пароль и запишите в `.env` как `GMAIL_APP_PASSWORD`.
6. В `GMAIL_USER` укажите тот же Gmail адрес.

> Обычный пароль от почты для SMTP не подойдет.

## 4) Ошибка `python-multipart` и проблема `pip launcher` на Windows
Если видите:
- `Form data requires "python-multipart" to be installed`
- `Fatal error in launcher ... pip.exe ... Flashback ...`

Используйте только:
```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Если venv поврежден:
```powershell
cd server
rmdir /s /q .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## 5) Тест с телефона в одной Wi‑Fi сети
1. Узнайте IP компьютера:
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` или `ip a`
2. Server запускайте с `HOST=0.0.0.0` (уже в `.env`).
3. Frontend запускайте `npm run dev:host`.
4. В `client/.env` поставьте `VITE_API_BASE=http://<IP_ПК>:8000/api`.
5. Разрешите порты в firewall:
   - `5173` (frontend)
   - `8000` (backend)
6. На телефоне откройте: `http://<IP_ПК>:5173`.

## 6) Что улучшено дополнительно
- Добавлена отдельная страница подтверждения email (`/auth/verify`).
- Ошибка `Invalid code` оформлена в стиле айдентики (выделенный error-box).
- Усилена обработка загрузки фото:
  - лимит размера файла 10MB,
  - проверка расширения,
  - валидация имени гостя,
  - защита от коллизии кода события.


## 7) dev_code для подтверждения (если SMTP временно недоступен)
Если Google SMTP не отправил письмо, backend при регистрации может вернуть `dev_code`.

Что делать:
1. Зарегистрируйтесь как обычно.
2. Если увидели сообщение о проблеме отправки письма, скопируйте `dev_code` из сообщения.
3. Откройте `/auth/verify`, введите email и этот `dev_code`.
4. После подтверждения войдите через `/auth`.

> `dev_code` предназначен только для локальной разработки/тестов. В production его лучше отключить.



## 8) Безопасность и валидации
- На backend добавлены базовые security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- Текстовые поля очищаются от HTML-подобных символов (`<`/`>`), чтобы снизить риск XSS-переноса данных.
- Для загрузок фото проверяются и расширение файла, и MIME type (`image/*`), а также лимит 10MB.
- Для события проверяется корректность диапазона дат (конец не раньше начала).
- При истекшей сессии клиент делает принудительный logout и отправляет пользователя на страницу входа.
