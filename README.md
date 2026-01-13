# Medical Laboratory Sample Tracking MVP

A production-ready MVP web application for tracking medical laboratory samples and monitoring Turnaround Time (TAT) in a general hospital setting.

## Features

- **Role-Based Access Control**:
  - Reception: Register new samples.
  - Lab Scientist: Update sample status within their unit.
  - Supervisor/Admin: View analytics and delays.
- **Sample Tracking Workflow**:
  - Statuses: Collected -> Received -> In Processing -> Awaiting Review -> Completed
  - Automatic Lab Number Generation (YY-MM-XXXX)
- **Turnaround Time (TAT) Engine**:
  - Real-time calculation of delays.
  - Visual indicators (Green/Yellow/Red) based on expected TAT.
- **Dashboards**:
  - Reception: Simple form for sample registration.
  - Scientist: Kanban-style or list view of active samples.
  - Supervisor: Summary metrics and unit performance.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: SQLite (via Prisma ORM) - *Easily switchable to PostgreSQL*
- **Auth**: NextAuth.js (Credentials Provider)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    - The project uses a local SQLite database for development ease.
    - Check `.env` for configuration (defaults are set).

4.  **Database Setup**:
    ```bash
    # Run migrations
    npx prisma migrate dev --name init
    
    # Seed the database with initial data (Units, Tests, Users)
    npx prisma db seed
    ```

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Login Credentials (Demo)

All accounts use the password: `password`

| Role | Email | Permissions |
|Str|Str|Str|
| **Reception** | `reception@lab.com` | Register samples |
| **Scientist** | `scientist@lab.com` | Update status (Haematology Unit) |
| **Reviewer** | `reviewer@lab.com` | Review samples |
| **Supervisor** | `supervisor@lab.com` | View analytics |
| **Admin** | `admin@lab.com` | Full access |

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `app/actions.ts`: Server Actions for data mutation and fetching.
- `app/auth.ts`: NextAuth configuration.
- `components/`: Reusable UI components.
- `prisma/`: Database schema and seed script.

## Deployment

To deploy to Vercel:
1.  Push code to a Git repository.
2.  Import the project into Vercel.
3.  Set `DATABASE_URL` and `NEXTAUTH_SECRET` in Vercel Environment Variables.
4.  *Note*: For production, switch the Prisma provider to `postgresql` in `prisma/schema.prisma` and use a managed Postgres database (e.g., Vercel Postgres, Supabase).
