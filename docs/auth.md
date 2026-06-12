# Authentication (opt-in scaffold)

This documents the opt-in local authentication scaffold added by the implementation.

How it works (scaffold):
- The backend registers a plugins/auth.js fastify plugin that exposes:
  - fastify.authEnabled (boolean)
  - fastify.verifyAuth(request) — throw unauthorized if auth required and not valid
- Toggle auth by setting AUTH_ENABLED=true in your .env file. When disabled, all requests are allowed (single-user mode).
- For quick testing, set AUTH_BYPASS_TOKEN to a fixed value and send header: `Authorization: Bearer <token>` to bypass the scaffold.

Next steps to make this production-ready:
- Implement JWT issuance on login and secure password storage (bcrypt)
- Add middleware to protect routes and user model + migrations
- Add login/logout endpoints and session management

Example .env entries (see .env.sample):
- AUTH_ENABLED=false
- AUTH_BYPASS_TOKEN=changeme
- JWT_SECRET=change_this_secret
