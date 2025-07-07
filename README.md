# Taskflow

Taskflow is a modern web application built with [Next.js](https://nextjs.org) and React. It is designed to provide a seamless and efficient task management experience, leveraging powerful libraries and services such as Convex for backend data management, Clerk for authentication, and Edgestore for real-time data synchronization.

## Project Overview

This project uses Next.js for server-side rendering and routing, React for building UI components, and TailwindCSS for styling. It integrates Convex as a backend platform to handle database queries and mutations with ease. Clerk is used to manage user authentication and authorization securely. Edgestore is employed to provide real-time data synchronization capabilities, ensuring that users see up-to-date information instantly.

## Installation

To get started, clone the repository and install the dependencies:

```bash
npm install
```

or

```bash
yarn install
```

or

```bash
pnpm install
```

## Environment Variables

This project requires certain environment variables to be set for Convex, Clerk, and Edgestore to function correctly. Create a `.env.local` file in the root directory of the project and add the following variables:

```env
# Convex configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk configuration
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
CLERK_API_KEY=your_clerk_api_key

# Edgestore configuration
NEXT_PUBLIC_EDGESTORE_URL=your_edgestore_url
```

Replace the placeholder values with your actual service URLs and API keys. The `.env.local` file is ignored by git and should not be committed to version control.

## Running the Development Server

Start the development server with:

```bash
npm run dev
```

or

```bash
yarn dev
```

or

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. The page will reload automatically as you make changes.

## Building and Starting for Production

To build the application for production, run:

```bash
npm run build
```

To start the production server after building, run:

```bash
npm start
```

## Dependencies

Key dependencies used in this project include:

- [Next.js](https://nextjs.org) - React framework for production
- [React](https://reactjs.org) - JavaScript library for building user interfaces
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [Convex](https://convex.dev) - Backend platform for data management
- [Clerk](https://clerk.com) - User authentication and management
- [Edgestore](https://edgestore.dev) - Real-time data synchronization
- Various UI and utility libraries such as Radix UI, Zustand, Zod, and more

For a full list of dependencies, see the `package.json` file.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://docs.clerk.com)
- [Edgestore Documentation](https://docs.edgestore.dev)

## Deployment

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

For more deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
