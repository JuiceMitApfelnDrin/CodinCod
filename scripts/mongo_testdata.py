# /// script
# dependencies = [
#   "pymongo"
# ]
# ///

import os

from pymongo import MongoClient

host = os.getenv("MONGO_HOST", "127.0.0.1")
port = int(os.getenv("MONGO_PORT", "27017"))
client = MongoClient(host, port)
db = client["codincod"]

TESTUSER = {
    "email": "dev@example.com",
    "username": "dev",
    "password": "$2b$10$1.NkZMEH4IBVTZb4mDebzOQvgFS.U0t5cmLPpYbkcFfVTFoYXgWA6",
}
testuser_id = db.users.insert_one(TESTUSER).inserted_id

FIZZBUZZ = {
    "title": "FizzBuzz",
    "authorId": testuser_id,
    "difficulty": "intermediate",
    "visibility": "draft",
    "tags": [],
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
    "constraints": "0 <= N < M <= 1000",
    "solution": {
        "code": 'n, m = [int(x) for x in input().split()]\nfor i in range(n, m+1):\n    fizz = i % 3 == 0\n    buzz = i % 5 == 0\n    print("Fizz" * fizz + "Buzz" * buzz + str(i) * (not fizz and not buzz))\n',
        "language": "python"
    },
    "statement": 'Print numbers from N to M except for every number divisible by 3 print "Fizz", and for every number divisible by 5 print "Buzz". For numbers divisible by both 3 and 5 print "FizzBuzz".'
}
db.puzzles.insert_one(FIZZBUZZ)
