# CodeSandbox

A powerful online code Sandbox supporting JavaScript and Python. Write, execute, and save your code instantly without any setup.

## Features

- **Instant Execution**: Run your code immediately with real-time output and error handling.
- **Multiple Languages**: Write in JavaScript, Python, and more with proper syntax support.
- **Save & Organize**: Automatically save and manage all your coding projects using a robust multi-directory system.
- **AI Code Assistance**: Built-in AI code generation and assistance to help you code faster.
- **Secure Authentication**: Secure user login and session management built into the platform.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Database**: [Neon Serverless Postgres](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)

## Getting Started

First, install the target dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables based on `.env.example`:

```bash
DATABASE_URL=your_neon_db_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
# Add other required API keys
```

### Database Setup

Push the database schema to your Neon database via Drizzle:

```bash
npm run db:push
# or to start local studio
npm run db:studio
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running.

## Deployment

The project can be deployed to Vercel or Render. Included in this repository are configuration files for Docker and Render (`render.yaml` and `Dockerfile.app`) specifically designed to simplify the deployment pipeline on Render.
