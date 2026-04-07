# Gurman Frontend (Admin Panel) — Roadmap покращень

> Документ для відстеження прогресу. Постав `[x]` коли пункт виконано.
> Складність: 🟢 легко (1-2 год) · 🟡 середньо (півдня-день) · 🔴 складно (2+ дні)
>
> Зв'язаний документ: [warehouse_mobile/ROADMAP.md](../warehouse_mobile/ROADMAP.md)

---

## 🚀 Sprint 1 — Critical Foundation (1 тиждень)

Базова інфраструктура для production.

### 1.1 Error Tracking
- [ ] Інтегрувати **Sentry** для React 🟡
  - `@sentry/react` + `@sentry/vite-plugin`
  - Source maps upload при build
  - Error boundary навколо `App.jsx`
  - **Acceptance**: видно JS errors з продакшну в Sentry dashboard

### 1.2 Environment configuration
- [ ] Винести Firebase config в `.env` файли 🟢
  - `.env.development` / `.env.production`
  - Перевірити що `firebase.js` читає з `import.meta.env`
- [ ] Документація в README як налаштувати локально 🟢
  - **Acceptance**: новий розробник може запустити проект за 5 хв

### 1.3 Auth & Permissions
- [ ] Перевірити Firebase Auth flow в `LoginPage.jsx` 🟢
- [ ] Role-based access (admin/manager/viewer) 🟡
- [ ] Protected routes wrapper компонент 🟡
- [ ] Logout button в header 🟢
  - **Acceptance**: різні юзери бачать різний контент

### 1.4 Loading & Error states
- [ ] Глобальний loading indicator (top progress bar) 🟢
- [ ] Toast notifications (`react-hot-toast` або `sonner`) 🟢
- [ ] Заміна `alert()` на toasts 🟢
  - **Acceptance**: всі async операції мають feedback

---

## 📊 Sprint 2 — Audit & Logs Pages (1-2 тижні)

Найбільший gap — дані збираються, але немає UI для перегляду.

### 2.1 Audit Review Page
- [ ] Створити `pages/AuditPage.jsx` 🟡
- [ ] Список сесій переобліку з Firebase RTDB (`audit_sessions`) 🟡
- [ ] Card на кожну сесію: ім'я, дата, прогрес, статус 🟢
- [ ] Деталі сесії з табками (Всі/Не перевірені/Перевірені/Розбіжності) 🟡
- [ ] Сортування по `difference` (найбільші розбіжності першими) 🟢
- [ ] Фільтр по `placeCode` 🟢
- [ ] Approve/Reject розбіжностей з коментарем 🟡
- [ ] Експорт сесії в Excel (через існуючий ExcelManager) 🟡
- [ ] Графік: топ-10 товарів з найбільшими розбіжностями 🟡
  - **Acceptance**: повний цикл переобліку без заходу в мобільну апку

### 2.2 Logs Viewer Page
- [ ] Створити `pages/LogsPage.jsx` 🔴
- [ ] Tabs по `actionType`: APP_SCAN / STATUS_CHANGE / WORKER_LOGIN / BUTTON_CLICK / APP_UPDATE / APP_ROLLBACK 🟡
- [ ] Фільтри: workerId, screen, dateRange, success/failed 🟡
- [ ] Пагінація (Firebase RTDB orderByChild + limitToLast) 🔴
- [ ] Таблиця з expandable rows для деталей 🟡
- [ ] Графіки в окремому tab:
  - [ ] Heatmap активності по годинах 🟡
  - [ ] Топ кнопок по натисканнях 🟢
  - [ ] К-сть помилок сканування за день 🟢
- [ ] Експорт в CSV 🟢
- [ ] Realtime mode (live updates) 🟡
  - **Acceptance**: можна знайти "що робив воркер X 15.04.2026 о 14:00"

### 2.3 Workers Performance Page
- [ ] Створити `pages/WorkersPage.jsx` 🟡
- [ ] Список воркерів з `workers_db` 🟢
- [ ] Card на воркера:
  - [ ] К-сть оброблених замовлень за період 🟡
  - [ ] Середній час комплектації 🟡
  - [ ] К-сть помилок (failed scans) 🟢
  - [ ] Останнє входу 🟢
- [ ] Графік activity heatmap (день × година) 🟡
- [ ] Top performers ranking 🟢
- [ ] Деталі воркера: всі його дії за день 🟡
  - **Acceptance**: можна оцінити продуктивність кожного воркера

---

## 🎨 Sprint 3 — UX Improvements (1 тиждень)

Покращення існуючих сторінок.

### 3.1 Dashboard (HomePage)
- [ ] Real-time лічильники замовлень по статусах 🟡
- [ ] Cards: сьогодні / вчора / тиждень 🟢
- [ ] Quick actions: створити накладну, переоблік, etc 🟢
- [ ] Recent activity feed (останні 20 дій з логів) 🟡
- [ ] Welcome message з ім'ям юзера 🟢
  - **Acceptance**: адмін бачить всю важливу інформацію на головній

### 3.2 Sidebar Navigation
- [ ] Згрупувати пункти меню (Operations / Analytics / Settings) 🟢
- [ ] Іконки для кожного пункту 🟢
- [ ] Collapse/expand 🟡
- [ ] Active state indicator 🟢
- [ ] Mobile responsive (hamburger menu) 🟡
  - **Acceptance**: зручна навігація на десктопі та планшеті

### 3.3 Data tables uniformity
- [ ] Створити `components/DataTable.jsx` (reusable) 🟡
- [ ] Уніфікувати: `OrdersPage`, `ProcessingTimePage`, `SalesPage` 🟡
- [ ] Загальні фічі: sort, filter, pagination, search 🟡
- [ ] Loading skeletons замість spinners 🟢
  - **Acceptance**: всі таблиці виглядають однаково

### 3.4 Dark mode
- [ ] Tailwind dark mode setup 🟢
- [ ] Theme toggle в header 🟢
- [ ] Тестування всіх сторінок 🟡
- [ ] Збереження preference в localStorage 🟢
  - **Acceptance**: можна перемикати тему

---

## 🤖 Sprint 4 — AI & Smart Features (2 тижні)

Розширення `GeminiAiTest` page.

### 4.1 Gemini Chat Assistant
- [ ] Floating chat widget на всіх сторінках 🔴
- [ ] Context: поточна сторінка + останні дії 🟡
- [ ] Можливість задавати питання по даних:
  - "Скільки замовлень обробив Олександр сьогодні?"
  - "Які товари найчастіше мають розбіжності?"
- [ ] Зберігати історію розмов 🟡
  - **Acceptance**: адмін може отримати інсайти через природну мову

### 4.2 Predictive Analytics Page
- [ ] Сторінка `pages/PredictionsPage.jsx` 🔴
- [ ] Restock alerts: товари що скоро закінчаться 🟡
- [ ] Сезонні тренди (якщо є історія 6+ міс) 🔴
- [ ] Демандні прогнози 🔴
- [ ] Рекомендації що замовити у постачальника 🟡
  - **Acceptance**: proactive insights без ручного аналізу

### 4.3 Smart search across all data
- [ ] Глобальний search bar в header 🔴
- [ ] Шукає по: orders, invoices, audits, workers 🟡
- [ ] Cmd+K shortcut 🟢
- [ ] Result groups з іконками 🟡
  - **Acceptance**: швидкий пошук будь-чого з будь-якої сторінки

---

## 📈 Sprint 5 — Reporting & Export (1 тиждень)

Звіти для бізнесу.

### 5.1 PDF Reports
- [ ] Daily report PDF (orders processed, errors, top workers) 🟡
- [ ] Weekly summary PDF 🟡
- [ ] Customizable templates 🔴
- [ ] Email scheduling (Cloud Function + cron) 🔴
  - **Acceptance**: щоранку приходить PDF з підсумками вчорашнього дня

### 5.2 Excel Manager improvements
- [ ] Custom column selection при експорті 🟡
- [ ] Pivot table builder 🔴
- [ ] Збереження пресетів експорту 🟡
- [ ] Bulk import товарів через Excel 🟡
  - **Acceptance**: гнучкий експорт під різні потреби

### 5.3 Charts library standardization
- [ ] Вибрати одну бібліотеку (Recharts / Chart.js / Tremor) 🟢
- [ ] Створити wrapper components 🟡
- [ ] Theme integration з Tailwind 🟢
  - **Acceptance**: всі графіки в одному стилі

---

## 🔒 Sprint 6 — Security & Performance (1 тиждень)

### 6.1 Firebase Security Rules
- [ ] Аудит правил Firestore 🟡
- [ ] Аудит правил Realtime Database 🟡
- [ ] `vendorprice` приховати від не-адмінів 🟡
- [ ] Тести через Firebase Emulator 🔴
  - **Acceptance**: воркер не може отримати чутливі дані через DevTools

### 6.2 Performance optimization
- [ ] Bundle size analysis (`vite-plugin-visualizer`) 🟢
- [ ] Code splitting per page (React.lazy) 🟡
- [ ] Image optimization (WebP, lazy loading) 🟢
- [ ] Lighthouse score > 90 🟡
  - **Acceptance**: швидке завантаження на всіх сторінках

### 6.3 Data caching
- [ ] React Query / SWR для Firebase reads 🔴
- [ ] Optimistic updates 🟡
- [ ] Stale-while-revalidate стратегія 🟡
  - **Acceptance**: миттєвий UI без зайвих запитів

---

## 🧪 Sprint 7 — Code Quality (1 тиждень)

### 7.1 TypeScript migration
- [ ] Поступове додавання TS (новий код) 🔴
- [ ] Tsconfig setup 🟢
- [ ] Конвертація `firebase.js` → `firebase.ts` 🟢
- [ ] Конвертація hooks 🟡
  - **Acceptance**: type safety для критичних модулів

### 7.2 Component library
- [ ] Створити `components/ui/` (Button, Input, Card, Modal) 🟡
- [ ] Storybook для документації 🔴
- [ ] Уніфікувати всі форми 🟡
  - **Acceptance**: дизайн система готова

### 7.3 Tests
- [ ] Vitest setup 🟢
- [ ] Unit tests для utils та hooks 🟡
- [ ] React Testing Library для критичних компонентів 🟡
- [ ] E2E (Playwright) для основних flows 🔴
  - **Acceptance**: тести запускаються в CI

---

## 🚢 Sprint 8 — DevOps & Deployment (3-5 днів)

### 8.1 CI/CD
- [ ] GitHub Actions: build + test on PR 🟡
- [ ] Auto-deploy на Vercel при merge в main 🟢
- [ ] Preview deployments для PR 🟢
- [ ] Slack notifications 🟢
  - **Acceptance**: автоматичний deploy

### 8.2 Monitoring
- [ ] Vercel Analytics 🟢
- [ ] Web Vitals tracking 🟢
- [ ] Uptime monitoring (UptimeRobot) 🟢
  - **Acceptance**: знаємо коли сайт впав

### 8.3 Documentation
- [ ] README з setup instructions 🟢
- [ ] CONTRIBUTING.md 🟢
- [ ] Architecture diagram 🟡
- [ ] API documentation 🟡
  - **Acceptance**: новий розробник онбоардиться за 1 день

---

## 📈 Метрики успіху

| Метрика | До | Ціль |
|---------|----|----|
| Page load time (LCP) | ? | < 2s |
| Lighthouse score | ? | > 90 |
| Error rate | ? | < 0.1% |
| Час від feedback до фічі | тижні | дні |
| Daily active admins | ? | track |

---

## 📝 Як працювати з роадмапом

1. **Кожна задача = один PR**. Маленькі PR краще ревʼюються
2. **Постав `[x]`** коли merge в main
3. **Не починай новий sprint** поки не закрив 80%+ попереднього
4. **Acceptance criteria** — не зачисляй задачу без виконання
5. **Синхронізуй з mobile roadmap** — деякі фічі залежать одна від одної

---

## 🔗 Залежності з Mobile

| Frontend feature | Mobile залежність |
|------------------|-------------------|
| Audit Review Page | потребує існуючої audit feature ✅ |
| Logs Viewer | потребує LoggingProvider ✅ |
| Workers Performance | потребує WORKER_LOGIN logs ✅ |
| AI Chat | можна робити незалежно |
| Predictions | потребує історичних даних 6+ міс |
