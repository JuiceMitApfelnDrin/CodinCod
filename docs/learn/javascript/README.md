---
title: Learn javascript
---

# Javascript

## The basics

### Syntax and structure

#### Variables

##### Var

##### Let

##### Const

##### Block vs function scope

#### Data types

##### String

###### Single quote

###### Double quote

###### String interpolation

###### Multi-line strings

##### Number

##### Boolean

##### Null

##### Undefined

##### Symbol

##### Bigint

##### Objects

#### Operators

#### Basic syntax

##### Comments

###### Single-line comments (//)

###### Multi-line comments

A multi line comment allows you to have multiple lines commented.

```javascript
/* the value of x is 1 */
const x = 1
```

### Functions

#### Function Declarations vs. Expressions

: Differences and use cases.

#### Arrow Functions: Syntax, this binding, and when to use them

#### Higher-Order Functions: Functions that take other functions as arguments or return them

#### Closures: How closures work and practical use cases

#### Default Parameters and Rest/Spread Operators: ...rest, ...spread, and default values

### Objects

#### Object Literals: Creating and manipulating objects

#### Object Destructuring

#### Properties and Methods: Adding, deleting, and accessing properties

### Arrays and Iteration

#### Array Methods: map, filter, reduce, forEach, some, every, find, findIndex, etc

#### Iteration: for, for...of, for...in, while, and do...while loops

#### Array Destructuring: Extracting values from arrays

#### Multidimensional Arrays: Working with nested arrays

## Advanced

### Type coercion <!-- Implicit and explicit type conversion. -->

### Optional chaining

### Nullish coalescing <!-- ?. and ?? operators. -->

## Testing: Writing unit tests with tools like Jest or Mocha

## Code golfing

These tips are for code golfing specifically, and are not generally applicable to the JavaScript language.

### Use short variable names

Use single-letter variable names (a, b, c, etc.) where possible.

Example:

```javascript
let x = 10; 

// Instead of 
let count = 10;
```

### Remove variable declaration

Often it is not required to declare a variable with `const`, `let` or `var`.

Example:

```javascript
x = 10;

// Instead of 
let x = 10;
```
