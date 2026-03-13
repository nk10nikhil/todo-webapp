# Landing Page: My Todo App

---

Reference: [Notion Site](https://notion.so/)

## Functionalities

- Drag and Drop Feature
- Add New Tasks
- Add New Views
- Open Task Drawer
- Add Task Description
- Optional Login / Register (email + password)
- Optional MongoDB Atlas cloud sync
- Guest mode still works with local storage only

## Optional Cloud Setup (MongoDB Atlas)

This project now supports cloud sync without a separate backend deployment by using serverless API routes inside the same project.

1. Copy `.env.example` to `.env`.
2. Set these values:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `JWT_SECRET`
3. Run with API routes enabled:
   - Local: `npx vercel dev`
   - Production: deploy this same project to Vercel

If API routes are not available (for example with plain `npm start`), the app still works in guest mode exactly like before (localStorage), but login/register and cloud sync are unavailable.

## Live Demo

[Click here](https://mytodoonweb.vercel.app/) for actual development
