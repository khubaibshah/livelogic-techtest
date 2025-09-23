# Frontend

PrimeVue-driven front-end for the LiveLogic tech test. The interface wraps the existing Sanctum authentication flows with a polished component library and presents the to-do mini app in a glassmorphism-inspired shell.

## Stack

- Vue 3 + Vite + TypeScript
- PrimeVue 4 with the Aura theme and PrimeIcons
- Pinia for state management
- Laravel Sanctum (backend) for auth/session APIs

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on [http://localhost:5173](http://localhost:5173) by default. Ensure the Laravel backend is running locally on port 8000 (or update `VITE_API_URL` in `frontend/.env`).

### Building for production

```bash
npm run build
npm run preview
```

## Features

- **Authentication tabs**: Login and registration forms sit inside a PrimeVue `TabView`, with inline validation and accessible error feedback.
- **PrimeVue components everywhere**: Buttons, cards, listboxes, dropdowns, and messages provide consistent styling with almost zero custom CSS.
- **Responsive dashboard**: After signing in, users see a welcome panel, quick workspace selector, and an upgraded to-do experience.
- **Task workspace upgrades**: To-do lists now offer list creation shortcuts, priority tags, and contextual actions inside PrimeVue cards.

## Troubleshooting

- Install the new UI dependencies if you pulled this branch: `npm install primevue primeicons @primevue/themes`.
- If `npm run dev` complains about missing types, restart your IDE so it picks up `src/types/primevue-components.d.ts`.
- The frontend expects Sanctum cookies; run the Laravel backend with `php artisan serve` and ensure CORS is aligned.
