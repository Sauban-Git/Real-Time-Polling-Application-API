# Real-time Polling Backend (Node.js + Express + Prisma + Socket.IO)

This repository implements a backend service for a real-time polling
application.\
It exposes a RESTful API for creating users, polls, and voting, and a
WebSocket layer (Socket.IO) for live updates of poll results.

---

# Table of Contents

1. Overview
2. Tech stack
3. Features & behavior
4. API endpoints (usage & examples)
5. WebSocket events (client/server behavior)
6. Setup & run (development)
7. Database migrations & seeding
8. Example requests (curl + JS)
9. Security notes & recommended improvements
10. Tests & debugging tips

---

# 1. Overview

This backend supports: - Creating and fetching users. - Creating polls
with options. - Casting votes for poll options. - Broadcasting live
results for a poll to all connected clients who subscribed to that poll.

The API is RESTful. Real-time updates use Socket.IO and rooms to scope
updates to clients viewing a particular poll.

---

# 2. Tech stack

- Node.js (LTS)
- Express.js
- PostgreSQL
- Prisma (ORM)
- Socket.IO (WebSocket layer)
- argon2 (for password hashing)
- dotenv (env configuration)

---

# 3. Features & behavior (short)

- `User` can create many `Poll`s (one-to-many).
- `Poll` contains many `PollOption`s (one-to-many).
- `User` can vote on many `PollOption`s; each `PollOption` can be
  voted by many `User`s --- modeled via `Vote` join table
  (many-to-many).
- When a vote is created, server computes updated counts for all
  options in that poll and emits `vote:new` to all clients subscribed
  to that poll.

---

# 4. API endpoints

Base URL: `http://localhost:3000` (configurable)

## Users

- `GET /user/`\
  Returns all users (excluding passwordHash).

- `POST /user/`\
  Create a new user.

  Request body (JSON):

  ```json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "plainPassword"
  }
  ```

## Don't forget to Set authorization headers after this

## Polls

- `POST /poll/`\
  Create a poll.

  Request body (JSON):

  ```json
  {
    "question": "Which is your favorite color?",
    "isPublished": true,
    "options": ["Red", "Blue", "Green"]
  }
  ```

  ### Notes: creatorId is same as of user id from user

## Votes

- `POST /vote`\
  Submit a vote.

  Request body (JSON):

  ```json
  {
    "optionId": 7
  }
  ```

  ### Notes: voterId is same as of user id from user

- `GET /vote/:id`\
  Get voting results for poll with id.

---

# 5. WebSocket (Socket.IO) events

## Client -\> Server

- `joinPoll`\
  Payload: `{ "pollId": <number> }`

## Server -\> Client

- `vote:new`\
  Emitted to room `poll-<pollId>` with updated results.

---

# 6. Setup & run (development)

## Prerequisites

- Node.js \>= 18
- PostgreSQL

## Env file

    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    PORT=3000

## Install & generate

```bash
npm install
npx prisma generate
```

## Run migrations

```bash
npx prisma migrate dev --name init
```

## Start dev server

```bash
npm run dev
```

---

# 7. Database migrations & seeding

```bash
npx prisma migrate dev --name init
node prisma/seed.js   # optional
```

---

# 8. Example requests

(See full README above for curl and Socket.IO examples.)

---

# 9. Security notes

- Passwords hashed with argon2.
- Validate inputs with `zod` or `express-validator`.
- JWT for authentication and authorization.

---

# 10. Tests & debugging tips

- Use Postman or curl to test.
- Use `npx prisma studio` to explore DB.
- Enable `DEBUG=socket.io:*` for socket logs.

---
