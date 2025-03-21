# CodinCod

## Table of contents

- [Introduction](#introduction)
- [Project overview](#project-overview)
- [Getting started](#getting-started)

## Introduction

Learning to code often feels like assembling IKEA furniture without the manual — frustrating and confusing. We’re here to change that.

CodinCod is your stress-free coding playground where:

- Open-source = no paywalls 🚫 – A free toolkit for everyone, from teens to retirees.
- Learn at your pace 🐢⚡ – Race through lessons or rewind tricky bits. Progress is progress!
- Gamified challenges = actual fun 🎯 – Unlock achievements by solving coding puzzles.

Think Duolingo or LEGO for coding. Less "*textbook lecture*", more "*aha!*" moments.

## Project overview

The [docs](./docs/README.md) exist to:

1. get up to speed quickly;
2. create a general shared understanding;
3. improve teamwork.

## Getting started

1. Required software:

   - [Git](https://git-scm.com/download/)
   - [NodeJs](https://nodejs.org/en/download/package-manager)
   - [Pnpm](https://pnpm.io/)
   - MongoDb instance: can be either [locally](https://www.mongodb.com/try/download/community) or in [mongodb's online environment](https://www.mongodb.com/cloud/atlas/register).
   - [Piston](https://github.com/engineer-man/piston), used for code execution in a safe environment, **if** you are **not** going to **execute code**, **you don't** technically **need it**

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
