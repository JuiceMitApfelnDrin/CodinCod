#!/bin/bash
LANGUAGES=(
    "brainfuck"
    "clojure" 
    "cobol"
    "crystal"
    "dart"
    "elixir"
    "gawk"
    "gcc"
    "go"
    "haskell"
    "julia"
    "kotlin"
    "lisp"
    "lua"
    "node"
    "perl"
    "prolog"
    "python"
    "raku"
    "ruby"
    "rust"
    "scala"
)

for lang in "${LANGUAGES[@]}"; do
    echo "Installing $lang..."
    just piston-install-latest "$lang"
done
