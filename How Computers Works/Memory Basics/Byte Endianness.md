---
publish: true
tags:
  - unfinished
---
# Introduction

Byte Endianness (well known just as endianness) is the ordination rule that determines how bytes are stored in memory (for more than one byte, as just one can't be reordered to reinterpret high and low bits, although they have high and low bits).

## The Nibbles Concept

In endianness, programming or both related stuff, a nibble means half of n-bits words. Lets take an example:

```
    +-------------+                          
    | Value Table |                          
    +-------------+-----------------+-------+
    | Power of 2  | 7 6 5 4 3 2 1 0 | Value |
    +-------------+-----------------+-------+
    | Bits        | 0 1 0 0 1 0 1 0 |    74 |
    +-------------+-----------------+-------+
```

This is the "translation table" from binary to decimal, as we can see, as much a bit is to the left, more it values, from $2^7$ to $2^0$ (that is $1$, as you can read in [[Why n power 0 is 1]])

---

# Refs

> Topic
> > Ref