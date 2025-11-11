# syntax=docker/dockerfile:1

FROM hexpm/elixir:1.16.3-erlang-24.3.4.17-ubuntu-noble-20250529

ENV LANG=C.UTF-8 \
    MIX_ENV=dev \
    HOME=/app

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    inotify-tools \
    git \
    postgresql-client \
  && rm -rf /var/lib/apt/lists/*

RUN mix local.hex --force \
  && mix local.rebar --force

COPY mix.exs mix.lock ./
COPY config config

RUN mix deps.get

CMD ["sh", "-c", "mix deps.get && mix ecto.create && mix ecto.migrate && mix phx.server"]
