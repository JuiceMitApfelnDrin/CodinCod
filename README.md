# CodinCod

## Table of contents

- [Introduction](#introduction)
- [Project overview](#project-overview)
- [Getting started](#getting-started)
- [Features](#features)
  - [User Roles](#user-roles)
  - [Puzzle Workflow](#puzzle-workflow)
  - [Moderation System](#moderation-system)

## Introduction

Learning to code often feels like assembling IKEA furniture without the manual — frustrating and confusing. We're here to change that.

CodinCod is your stress-free coding playground where:

- Open-source = no paywalls 🚫 – A free toolkit for everyone, from teens to retirees.
- Learn at your pace 🐢⚡ – Race through lessons or rewind tricky bits. Progress is progress!
- Gamified challenges = actual fun 🎯 – Unlock achievements by solving coding puzzles.

Think Duolingo or LEGO for coding. Less "*textbook lecture*", more "*aha!*" moments.

## Project overview

The [docs](https://codincod.com/docs) exist to:

1. get up to speed quickly;
2. create a general shared understanding;
3. improve teamwork.

## Getting started

1. Required software:

   - [Git](https://git-scm.com/download/)
   - [NodeJs](https://nodejs.org/en/download/package-manager)
   - [Pnpm](https://pnpm.io/)
   - MongoDb instance: can be either [locally](https://www.mongodb.com/try/download/community) or in [mongodb's online environment](https://www.mongodb.com/cloud/atlas/register).
   - [Piston](https://github.com/engineer-man/piston), used for code execution in a safe environment, **if** you are **not** going to **execute code**, **you don't** technically **need it**, if you want to use the [just files](https://just.systems/), you will probably need to install [jq](https://jqlang.org/).

2. Clone the project structure and its submodules:

   ```bash
   git clone https://github.com/JuiceMitApfelnDrin/CodinCod
   ```

3. Build the types (required by both libs/backend and libs/frontend)

   ```bash
   cd CodinCod/libs/types
   pnpm install
   pnpm build
   ```

4. Follow the instructions for the [backend](./libs/backend/README.md) and/or [frontend](./libs/frontend/README.md) depending on what you're working on

## Features

### User Roles

CodinCod uses a simple role-based system:

- **User** (default): Can create puzzles, play games, submit solutions, and report issues
- **Moderator**: Has all user permissions plus the ability to review and moderate content

The role system is designed to be simple and maintainable, with plans for more granular permissions in the future.

### Puzzle Workflow

Puzzles go through a structured review process:

1. **Draft**: Author is working on the puzzle
2. **Ready**: Puzzle is complete and ready for moderator review
3. **Review**: Currently being reviewed by moderators
4. **Revise**: Moderator requested changes
5. **Approved**: Puzzle is approved and visible to all users
6. **Inactive**: Temporarily hidden
7. **Archived**: No longer active

### Moderation System

The moderation system allows moderators to:

- **Review Pending Puzzles**: Approve or request revisions on puzzles submitted for publication
- **Handle Reports**: Review and resolve reports for:
  - Puzzles with inappropriate content or issues
  - Users violating community guidelines
  - Comments that are offensive or spam

Moderators can access the moderation dashboard at `/moderation` to:
- View all pending items in a unified table
- Switch between different review types
- Take actions (approve, revise, resolve, reject)
- Track who reported issues and when
