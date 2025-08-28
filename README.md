# Taskflow

**Taskflow** is a modern task management web application built with [Next.js](https://nextjs.org), [React](https://reactjs.org), and [TailwindCSS](https://tailwindcss.com). It offers real-time collaboration, secure authentication, and a clean UI to manage tasks and documents seamlessly.

> Powered by **Convex** for backend logic, **Clerk** for user authentication, and **Edgestore** for file storage and real-time sync.

---
## Project Overview

This project uses Next.js for server-side rendering and routing, React for building UI components, and TailwindCSS for styling. It integrates Convex as a backend platform to handle database queries and mutations with ease. Clerk is used to manage user authentication and authorization securely. Edgestore is employed to provide real-time data synchronization capabilities, ensuring that users see up-to-date information instantly.

---

## 🚀 Features

* 🧠 Built with Next.js App Router
* 💾 Real-time data handling with Convex
* 🔐 Secure auth using Clerk
* ☁️ Edge-powered file uploads via Edgestore
* 🎨 Responsive and themeable UI with TailwindCSS
* 🧱 Modular component structure
* 🧠 State management using Zustand
* 🔗 Real-time document sharing with live presence and access control
* 🌍 Multilingual document translation with save and switch options
* 🤖 AI Chat Assistant to query document content
* 📄 Download documents as clean, styled PDFs
* 🔔 Toast feedback on key user actions

---

## 📁 Project Structure

```
.
├── app/                   # App directory (Next.js routing)
│   ├── (main)/            # Authenticated experience
│   ├── (marketing)/       # Landing and public pages
│   ├── (public)/          # Public-facing routes
│   ├── api/               # API routes (e.g., for uploads)
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable and route-specific components
│   ├── main/              # Components for main user app
│   ├── marketing/         # Components for marketing pages
│   ├── modals/            # Modal components
│   ├── providers/         # Context and theme providers
│   ├── ui/                # Shared UI primitives (Button, Input, etc.)
│   └── upload/            # Upload UI components
├── convex/                # Backend logic (Convex)
│   ├── schema.ts          # Convex schema
│   ├── documents.ts       # Document logic
│   └── _generated/        # Auto-generated Convex files
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and Edgestore logic
├── public/               # Static assets
├── .env.local.example    # Example environment config
├── tailwind.config.ts    # Tailwind configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

---

## 🛠️ Installation

First, clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
CLERK_API_KEY=your_clerk_api_key

# Edgestore
NEXT_PUBLIC_EDGESTORE_URL=your_edgestore_url

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## 🧪 Development

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🧱 Core Dependencies

| Package           | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `next`           | Framework for SSR and routing            |
| `react`          | UI library                               |
| `tailwindcss`    | Styling with utility classes             |
| `convex`         | Real-time backend and database           |
| `clerk`          | Authentication and user management       |
| `edgestore`      | File uploads and real-time sync          |
| `zod`            | Schema validation                        |
| `zustand`        | State management                         |
| `html2pdf.js`    | Clean PDF downloads                      |
| `react-hot-toast`| Toast notifications                      |
| `openai`         | AI integration for chat-to-document      |

---

## 🔍 Learn More

* [Next.js Docs](https://nextjs.org/docs)
* [Convex Docs](https://docs.convex.dev)
* [Clerk Docs](https://docs.clerk.com)
* [Edgestore Docs](https://docs.edgestore.dev)
* [OpenAI Docs](https://platform.openai.com/docs)
* [Tailwind Docs](https://tailwindcss.com/docs)

---

## 🌐 Deployment

The easiest way to deploy this app is through [Vercel](https://vercel.com), with zero-config support for Next.js.

For manual deployment:

* Set environment variables
* Build the app: `npm run build`
* Serve with: `npm start` or any Node.js hosting platform

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📸 Preview

> *Add a screenshot here if you have one!*

---

## 📄 License

License Name © 2025 YourName or YourTeam