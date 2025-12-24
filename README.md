
# ⚛️ Next.js Quiz Platform with MongoDB 📝 🚀

Welcome to the Next.js Quiz Platform! This interactive application allows users to create, manage, and share quizzes, now powered by a flexible and scalable backend using Next.js, MongoDB, and NextAuth.js.

## 🔍 Overview

This quiz platform is built with a modern, full-stack JavaScript architecture. It leverages the Next.js App Router for the frontend and API, Mongoose for data modeling, and MongoDB as the database. Authentication is handled seamlessly by NextAuth.js, providing both credential-based and OAuth sign-in options.

The platform features a clean, responsive UI built with Ant Design and Tailwind CSS, with a focus on usability and performance.

## 📚 What You'll Learn

By exploring this codebase, you'll learn how to:

- Build a full-stack application with the Next.js App Router.
- Integrate MongoDB with a Next.js application using Mongoose.
- Implement robust authentication with NextAuth.js (credentials and Google OAuth).
- Create protected API routes and manage user sessions.
- Model data effectively for a NoSQL database like MongoDB.
- Handle file uploads and integrate with cloud storage services (e.g., Cloudinary).
- Build a dynamic and interactive user interface with React, Ant Design, and Tailwind CSS.

## 🛠️ Tech Stack

- **Next.js**: React framework for server-rendered applications and API routes.
- **TypeScript**: For type safety and a better developer experience.
- **MongoDB**: A flexible, scalable NoSQL database.
- **Mongoose**: An elegant MongoDB object modeling tool for Node.js.
- **NextAuth.js**: A complete open-source authentication solution for Next.js applications.
- **Ant Design**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **bcryptjs**: Library for hashing passwords.

## 💻 Features

- **User Authentication**: Sign up, login (with email/password and Google), and user session management.
- **Quiz Creation**: Create quizzes with a title, description, and cover image.
- **Question Management**: Add, edit, and manage questions embedded within each quiz.
- **Secure API**: Protected API endpoints that ensure only authenticated users can create, update, or delete content.
- **Ownership**: Quizzes are linked to their authors, and only the author can modify or delete their own quizzes.
- **Responsive Design**: Works on desktop and mobile devices.

## 🧠 Project Structure

```
quiz-platform/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth.js catch-all route
│   │   ├── quizzes/
│   │   │   ├── [id]/           # Dynamic API routes for specific quizzes
│   │   │   └── route.ts        # API routes for creating/getting quizzes
│   │   └── upload/           # (Mock) API route for file uploads
│   ├── (auth)/             # Route group for auth-related pages
│   ├── quizzes/            # UI pages for quizzes
│   └── ...                 # Other UI pages and layouts
├── lib/
│   ├── mongodb.ts          # MongoDB connection handler
│   ├── mongodbClient.ts    # MongoDB client promise for NextAuth adapter
├── models/
│   ├── User.ts             # Mongoose model for Users
│   ├── Quiz.ts             # Mongoose model for Quizzes
├── public/                 # Static assets
├── .env.local.example      # Example environment variables
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies
```

## 📦 Installation

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm
- A MongoDB database (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))
- Google Cloud Platform project for Google OAuth credentials

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/habaoanh/quiz_app_mongo.git
    cd quiz_app_mongo
    ```

2.  **Install dependencies:**

    ```shell
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file by copying `.env.local.example` and fill in the required values:

    ```plaintext
    # Your MongoDB connection string
    MONGODB_URI=

    # A random secret string used to hash tokens
    NEXTAUTH_SECRET=

    # Google OAuth credentials
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    ```

    You can generate a `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in your terminal.

4.  **Start the development server:**

    ```shell
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com):

1.  Push your code to a GitHub repository.
2.  Import your project into Vercel.
3.  Add your environment variables (`MONGODB_URI`, `NEXTAUTH_SECRET`, etc.) in the Vercel project settings.
4.  Deploy!

Happy quizzing! 📝✨

If you have any questions or need help, feel free to open an issue in this repository.

Don't forget to star ⭐ this repository if you found it helpful!
