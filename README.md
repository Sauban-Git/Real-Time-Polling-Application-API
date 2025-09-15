# Real-time Polling Backend (Node.js + Express + Prisma + Socket.IO)

This repository implements a backend service for a real-time polling
application.\
It exposes a RESTful API for creating users, polls, and voting, and a
WebSocket layer (Socket.IO) for live updates of poll results.

No emojis used.

------------------------------------------------------------------------

# Table of Contents

1.  Overview
2.  Tech stack
3.  Features & behavior
4.  Prisma schema (database design)
5.  API endpoints (usage & examples)
6.  WebSocket events (client/server behavior)
7.  Setup & run (development)
8.  Database migrations & seeding
9.  Example requests (curl + JS)
10. Security notes & recommended improvements
11. Tests & debugging tips
12. Appendix: example responses

------------------------------------------------------------------------

# 1. Overview

This backend supports: - Creating and fetching users. - Creating polls
with options. - Casting votes for poll options. - Broadcasting live
results for a poll to all connected clients who subscribed to that poll.

The API is RESTful. Real-time updates use Socket.IO and rooms to scope
updates to clients viewing a particular poll.

------------------------------------------------------------------------

# 2. Tech stack

-   Node.js (LTS)
-   Express.js
-   PostgreSQL
-   Prisma (ORM)
-   Socket.IO (WebSocket layer)
-   argon2 (for password hashing)
-   dotenv (env configuration)

------------------------------------------------------------------------

# 3. Features & behavior (short)

-   `User` can create many `Poll`s (one-to-many).
-   `Poll` contains many `PollOption`s (one-to-many).
-   `User` can vote on many `PollOption`s; each `PollOption` can be
    voted by many `User`s --- modeled via `Vote` join table
    (many-to-many).
-   When a vote is created, server computes updated counts for all
    options in that poll and emits `vote:new` to all clients subscribed
    to that poll.

------------------------------------------------------------------------

# 4. Prisma schema (database design)

Below is the recommended `prisma/schema.prisma`. It models relationships
as requested.

``` prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int     @id @default(autoincrement())
  name         String
  email        String  @unique
  passwordHash String
  polls        Poll[]  @relation("UserPolls")
  votes        Vote[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Poll {
  id         Int          @id @default(autoincrement())
  question   String
  isPublished Boolean     @default(false)
  creator    User         @relation(fields: [creatorId], references: [id], name: "UserPolls")
  creatorId  Int
  options    PollOption[]
  votes      Vote[]
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
}

model PollOption {
  id       Int     @id @default(autoincrement())
  text     String
  poll     Poll    @relation(fields: [pollId], references: [id])
  pollId   Int
  votes    Vote[]
}

model Vote {
  id           Int        @id @default(autoincrement())
  user         User       @relation(fields: [userId], references: [id])
  userId       Int
  pollOption   PollOption @relation(fields: [pollOptionId], references: [id])
  pollOptionId Int
  pollId       Int
  createdAt    DateTime   @default(now())

  @@unique([userId, pollOptionId], name: "one_vote_per_user_per_option")
}
```

------------------------------------------------------------------------

# 5. API endpoints

Base URL: `http://localhost:3000` (configurable)

## Users

-   `GET /user/`\
    Returns all users (excluding passwordHash).

-   `POST /user/`\
    Create a new user.

    Request body (JSON):

    ``` json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "password": "plainPassword"
    }
    ```

## Polls

-   `POST /poll/`\
    Create a poll.

    Request body (JSON):

    ``` json
    {
      "question": "Which is your favorite color?",
      "isPublished": true,
      "creatorId": 1,
      "options": [
        { "text": "Red" },
        { "text": "Blue" },
        { "text": "Green" }
      ]
    }
    ```

## Votes

-   `POST /vote`\
    Submit a vote.

    Request body (JSON):

    ``` json
    {
      "optionId": 7,
      "userId": 3
    }
    ```

-   `GET /vote/:id`\
    Get voting results for poll with id.

------------------------------------------------------------------------

# 6. WebSocket (Socket.IO) events

## Client -\> Server

-   `joinPoll`\
    Payload: `{ "pollId": <number> }`

## Server -\> Client

-   `vote:new`\
    Emitted to room `poll_<pollId>` with updated results.

------------------------------------------------------------------------

# 7. Setup & run (development)

## Prerequisites

-   Node.js \>= 18
-   PostgreSQL

## Env file

    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    PORT=3000

## Install & generate

``` bash
npm install
npx prisma generate
```

## Run migrations

``` bash
npx prisma migrate dev --name init
```

## Start dev server

``` bash
npm run dev
```

------------------------------------------------------------------------

# 8. Database migrations & seeding

``` bash
npx prisma migrate dev --name init
node prisma/seed.js   # optional
```

------------------------------------------------------------------------

# 9. Example requests

(See full README above for curl and Socket.IO examples.)

------------------------------------------------------------------------

# 10. Security notes

-   Passwords hashed with argon2.
-   Use JWT or sessions for auth.
-   Validate inputs with `zod` or `express-validator`.
-   Consider rate limiting and CSRF protection.

------------------------------------------------------------------------

# 11. Tests & debugging tips

-   Use Postman or curl to test.
-   Use `npx prisma studio` to explore DB.
-   Enable `DEBUG=socket.io:*` for socket logs.

------------------------------------------------------------------------

# 12. Appendix: Example responses

``` json
{
  "pollId": 5,
  "question": "Which is your favorite color?",
  "options": [
    { "optionId": 7, "text": "Red", "votes": 10 },
    { "optionId": 8, "text": "Blue", "votes": 4 }
  ]
}
```
