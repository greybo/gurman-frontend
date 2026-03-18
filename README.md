# Gurman Frontend

Адмінка для керування замовленнями Gurman. React 19 + Vite 7, Firebase Realtime Database, Firebase Hosting.

---

## Вимоги

- **Node.js** >= 20
- **npm** >= 9
- **Firebase CLI** встановлений глобально:
  ```bash
  npm install -g firebase-tools
  ```
- Доступ до Firebase проєкту (потрібні права Viewer або вище)

---

## Змінні середовища

Створи файл `.env` у корені папки `gurman_frontend/`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Значення знаходяться в **Firebase Console → Project Settings → Your apps → SDK setup and configuration**.

> **Важливо:** файл `.env` не комітити в git — він вже повинен бути в `.gitignore`.

---

## Локальний запуск

```bash
# Встановити залежності
npm install

# Запустити dev-сервер (http://localhost:3000)
npm run dev
```

---

## Збірка для продакшн

```bash
npm run build
```

Готові файли з'являться у папці `dist/`.

Перевірити збірку локально:

```bash
npm run preview
```

---

## Деплой на Firebase Hosting

### 1. Авторизація (якщо ще не зроблено)

```bash
firebase login
```

### 2. Переконатись, що вибраний правильний проєкт

```bash
firebase use --list
```

Якщо потрібно переключитись:

```bash
firebase use <project_id>
```

### 3. Зібрати проєкт

```bash
npm run build
```

### 4. Задеплоїти тільки Hosting

```bash
firebase deploy --only hosting
```

Після успішного деплою Firebase виведе посилання на живий сайт.

---

## Повний деплой (Hosting + Functions разом)

Якщо треба задеплоїти і фронт, і бекенд одночасно — запускати з кореневої папки проєкту (де лежить головний `firebase.json`):

```bash
cd ..
firebase deploy
```

---

## Структура проєкту

```
gurman_frontend/
├── src/
│   ├── pages/          # Сторінки: Analytics, Sales, AuditLogs, Settings, Excel, Login
│   ├── components/     # Спільні компоненти (PrivateRoute тощо)
│   ├── contexts/       # AuthContext (Firebase Auth)
│   ├── hooks/          # Кастомні хуки (useAuditLogsData тощо)
│   ├── firebase/       # Ініціалізація Firebase
│   ├── PathDb.jsx      # Шляхи до Firebase Realtime Database
│   ├── App.jsx         # Роутинг і навігація
│   └── index.css       # Глобальні стилі
├── public/
├── .env                # Змінні середовища (не комітити!)
├── vite.config.js
└── package.json
```

---

## Скрипти

| Команда | Опис |
|---|---|
| `npm run dev` | Dev-сервер на порту 3000 |
| `npm run build` | Продакшн збірка у `dist/` |
| `npm run preview` | Локальний перегляд збірки |
| `npm run lint` | Перевірка ESLint |
| `npm run deploy` | Збірка + деплой на Firebase Hosting |
