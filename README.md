# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e8001daf-fa2d-4e73-b90d-037e3cca90e5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e8001daf-fa2d-4e73-b90d-037e3cca90e5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e8001daf-fa2d-4e73-b90d-037e3cca90e5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

# MERN Property Management (Monorepo)

A full-stack property management system using MongoDB, Express, React, and Node.js with TypeScript.

## Structure

- `server/` – Express API (TS) with Mongoose models, JWT auth, and admin/user roles
- `src/` – Existing Vite React app (can be migrated under `client/` later). A new `client/` may be added to integrate with this API.

## Server Setup

Environment file: `server/.env`

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/thematka
JWT_SECRET=change_this_dev_secret_please
TOKEN_EXPIRES=7d
CLIENT_URL=http://localhost:5173
# Optional admin seed
ADMIN_EMAIL=admin@thematka.local
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=Admin
```

Install and run (from `server/`):

```
npm install
npm run dev
# seed admin (one-time)
npm run seed
```

API base: `http://localhost:4000/api`

### Endpoints
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/admin/login`, `POST /auth/logout`, `GET /auth/me`
- Properties: `GET /properties`, `GET /properties/:slug`, `POST /properties` (admin), `PUT /properties/:id` (admin), `DELETE /properties/:id` (admin)
- Pages: `GET /pages/:slug`, `PUT /pages/:slug` (admin upsert)
- Enquiries: `POST /enquiries`, `GET /enquiries` (admin)
- Users: `GET /users` (admin), `PATCH /users/:id/status` (admin)

Security: HttpOnly cookies (token) and Bearer supported. CORS restricted by `CLIENT_URL`.

## Client Integration

- Set an env (e.g. `client/.env`) with `VITE_API_URL=http://localhost:4000/api`
- Use Authorization: Bearer or rely on HttpOnly cookie with `credentials: 'include'`
- Routes required: Home, All Listings, Property Detail, About, Contact, Auth (login/signup/admin), User Panel, Admin Panel

## Development Notes

- TypeScript enforced across server
- ESLint/Prettier recommended
- 404 and error handling included
- Seed script creates an admin if missing

