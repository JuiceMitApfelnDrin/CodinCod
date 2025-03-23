# /// script
# dependencies = [
#   "pymongo"
# ]
# ///

import os

from pymongo import MongoClient

host = os.getenv("MONGO_HOST", "127.0.0.1")
port = int(os.getenv("MONGO_PORT", "27017"))
db_name = os.getenv("MONGO_DB_NAME", "codincod-dev")

client = MongoClient(host, port)
db = client[db_name]

TESTUSER = {
    "email": "codincoder@example.com",
    "username": "codincoder",
    "password": "$2b$10$1.NkZMEH4IBVTZb4mDebzOQvgFS.U0t5cmLPpYbkcFfVTFoYXgWA6",
}
testuser_id = db.users.insert_one(TESTUSER).inserted_id

FIZZBUZZ = {
    "title": "FizzBuzz",
    "statement": 'Print numbers from N to M except for every number divisible by 3 print "Fizz", and for every number divisible by 5 print "Buzz". For numbers divisible by both 3 and 5 print "FizzBuzz".',
    "constraints": "0 <= N < M <= 1000",
    "author": testuser_id,
    "validators": [
        {
            "input": "1 3",
            "output": "1\n2\nFizz",
        },
        {
            "input": "3 5",
            "output": "Fizz\n4\nBuzz",
        },
        {
            "input": "1 16",
            "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16",
        }
    ],
    "difficulty": "intermediate",
    "visibility": "draft",
    "solution": {
        "code": 'n, m = [int(x) for x in input().split()]\nfor i in range(n, m+1):\n    fizz = i % 3 == 0\n    buzz = i % 5 == 0\n    print("Fizz" * fizz + "Buzz" * buzz + str(i) * (not fizz and not buzz))\n',
        "language": "python",
        "languageVersion": "3.12.0"
    },
    "tags": [],
}
db.puzzles.insert_one(FIZZBUZZ)

EASY = {
    "title": "Easy",
    "statement": 'Print 42.',
    "author": testuser_id,
    "validators": [
        {
            "input": "1",
            "output": "42",
        },
        {
            "input": "2",
            "output": "42",
        },
        {
            "input": "3",
            "output": "42",
        }
    ],
    "difficulty": "beginner",
    "visibility": "approved",
    "solution": {
        "code": 'print(42)',
        "language": "python",
        "languageVersion": "3.12.0"
    },
    "tags": [],
}
db.puzzles.insert_one(EASY)
