# 🏥 Medical Appointment Booking System
## Hệ thống Đặt lịch Khám bệnh

A complete medical appointment booking system with 21 fully functional pages built with React + TypeScript + Vite + Material-UI.

> 📖 **[Đọc hướng dẫn tiếng Việt tại đây](./HUONG_DAN.md)** - Vietnamese documentation

## 🚀 Quick Start

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

### Build for production
```bash
npm run build
```

## 👥 Test Accounts

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| **Admin** | admin@hospital.vn | 123456 | /admin/login |
| **Doctor** | bs.nguyenvana@hospital.vn | 123456 | /doctor/login |
| **Patient** | patient1@gmail.com | 123456 | /patient/login |

Or register a new patient account at `/patient/register`

## 📦 Features

### Patient Module (8 pages)
- Registration & Login
- Dashboard with appointment statistics
- 4-step booking wizard (specialty → service/doctor → date/shift → confirm)
- Appointment management with 5 status tabs
- Medical history with prescription details

### Admin Module (10 pages)
- User, Doctor, Specialty, Service, and Shift management
- Appointment approval workflow
- Patient check-in system
- Comprehensive appointment tracking

### Doctor Module (3 pages)
- Appointment dashboard with filters
- Examination page with medical records & prescriptions
- Patient history view

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** - Build tool
- **Material-UI v7** - UI components
- **React Router v6** - Routing
- **React Hook Form** + **Yup** - Forms & validation
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **react-toastify** - Notifications

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
