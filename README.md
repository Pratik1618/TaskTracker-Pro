# TaskTracker Pro

![TaskTracker Pro](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)

**TaskTracker Pro** is a modern, premium workspace console designed for seamless task management, daily work logging, and automated reporting. Built with the latest frontend technologies, it offers a purely local, privacy-first experience using browser-based state persistence.

## 🚀 Key Features

*   **Comprehensive Task Management:** Create, update, and monitor tasks with priorities, custom statuses, and expected end dates.
*   **Daily Work Logs:** Log daily activities mapped to specific tasks. Automatically calculates hours spent and syncs task progress.
*   **Automated Email Reports:** Automatically generate EOD (End of Day) reports summarizing work done, formatted perfectly for your mail client with support for CC recipients.
*   **Zero-Backend Architecture:** 100% privacy-focused. All tasks, profiles, and sessions are stored directly in your browser's `localStorage`.
*   **Dark & Light Mode:** Seamless theme toggling powered by `next-themes` and Tailwind CSS, fully supported across all UI components.
*   **Mock Authentication Flow:** A fully designed login interface showcasing session state management.
*   **Premium UI/UX:** Built with Shadcn UI, featuring glassmorphism, dynamic gradients, responsive layouts, and interactive micro-animations.

## 🛠️ Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **State Management:** Custom React Hooks + Local Storage API

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pratik1618/TaskTracker-Pro.git
   cd TaskTracker-Pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Usage Guide

*   **Login:** Since this is a local-storage app, the authentication is simulated. Enter **any** email and password combination to sign in.
*   **Profile Setup:** Click on your profile in the bottom left corner to add your name, manager details, and avatar.
*   **Theme Toggle:** Switch between Dark and Light mode using the sun/moon icon next to your profile.
*   **Logging Work:** Head to the "Work Logs" section to clock your hours. When you generate an email, it will open your default mail client with a pre-formatted breakdown of your day.

## 🏗️ Architecture Notes
This project demonstrates advanced frontend capabilities:
- Complex interdependent state handling without reliance on external libraries like Redux.
- Advanced Tailwind configurations, utilizing the new v4 CSS variables specification.
- Component-driven development strictly enforcing Separation of Concerns.

## 📝 License
This project is for demonstration and personal productivity purposes.

## Documentation
*   [API Documentation](./API_DOCUMENTATION.md)
*   [OpenAPI Spec](./openapi.yaml)
*   [Postman Collection](./TaskTracker.postman_collection.json)

---
*Designed and built by Pratik.*
