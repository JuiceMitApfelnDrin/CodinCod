# Knowledge base<!-- omit from toc -->

This repo exists to:

1. get up to speed quickly;
2. create a general shared understanding;
3. improve teamwork.

## Table of contents<!-- omit from toc -->

- [Codebase](#codebase)
  - [CodinCod](#codincod)
    - [User stories](#user-stories)
    - [Front-end](#front-end)
    - [Back-end](#back-end)
- [Ideas / To-do:](#ideas--to-do)

## Codebase

### CodinCod

#### User stories

Different scenarios that we want to support, for all the types of users.

For more information on what user stories are or on how to write them [Visit this README.md](./codebase/CodinCod/user-stories/README.md).

Current user types:

- [player](./codebase/CodinCod/user-stories/player.md);

#### Front-end

Front-end specific information about CodinCod.

#### Back-end

Back-end specific information about CodinCod.


## Ideas / To-do:

- ranking system?
  - glicko2? based with rating deviation based on the games played in the last X days (see [github lila](https://github.com/lichess-org/lila/blob/21f0eef20576b43bd8942e9a9f9a35543e346a76/modules/rating/src/main/Glicko.scala))
- ranked games
  - all people are in a game since the start
- unranked games?
  - 1 man games (only 1 person when the game started)
  - private games
  - late joiners (when a game is already in progress, anyone who joins late can't get ranking)

- weekly events (2 times / day? or once a day every but rotating schedule?)
