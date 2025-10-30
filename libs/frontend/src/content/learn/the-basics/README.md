---
title: Learn the basics
---

# The basics

In order to understand things, analogies are often helpful.

The analogy we will use here to understand programming, is one from a packer perspective.
You are in a warehouse, packing boxes.
You have different boxes for different things, a small box for a knife sized item, a big box for a fridge, and an envloppe for a bank card.

These boxes are data types.

## common data types

Data types, are agreed upon things, that are often present in languages.
You can make your own data types as well, but that's maybe for a different chapter.

### integer / number

One of the simplest data types to understand is the number one. It allows computer and us, in code to use numbers like we're used to. We can `1 + 1` or `1 - 1`, etc.

Different languages have different ways of writing them, lets make up our own language and write it as:

```ruby
number1 = 1
```

### character

Numbers aren't the only things we use, we write things down, like this whole page, and to make sense out of this, or to make sense out of the programs we write, we have added characters to our code over time, it's also handy to display certain messages to people.

```ruby
h = 'h'
```

### array / list

An array or list is a sequence of a certain data type, for example, a conveyer belt of boxes of a particular size. All the very large boxes for optimization reasons go on the same conveyer belt, whilst the smaller things are grouped together on other conveyer belts.
They don't have to necessarily be grouped together, but it will make sense in a second why it could be handy.

```ruby
list = [1, 2, 3, 4, 5, 6, 7, 8]
```

### string

A string is a list / array of characters often internally, the sequence of characters form a word, sentence or even a whole book.

```ruby
sentence = "Hello world!"
```

### boolean

This is probably the easiest to understand box, it's either `true` or `false`, nothing in between.

```ruby
theAuthorIsHandsome = true
```

## control structures

In order to put all these data types to use, we need sometimes some additional help.

### conditional statements

When we want to control what happens, `A` or `B` then we can use an `if` statement.
Thinking back in our conveyer belts, in order to determine where a box has to go, we can look at the size of the box, and tell it to go left if it exceeds some height.

```ruby
if theAuthorIsHandsome then
    display(sentence)
else
    display(anotherSentence)
end
```

### loops

Sometimes you don't want to do the same things over and over again. But you don't want to think about it. Or you're busy with other stuff.

#### while

As long as something is true, this will run. If it is true forever, it will run forever.

```ruby
while theAuthorIsHandsome do
    display(sentence)
end
```

#### for

If you know for how many steps you have to do something, this loop is a little more useful, you can say for A to B do the following.

```ruby
for number in 0 to 10 do
    display(number)
end
```

---

That's all there is to programming, the rest is limited only by your creativity.
Every language has their own writing style, and issues and benefits.
There are many discussions about which one is the best or worst, but I won't partake in any of those.

The easiest language for me to learn, was ruby, so if you don't know what direction you want to go in, that's a solid choice!

Good luck, may the code be with you!

<!-- TODO: add a place for people to try out things -->
