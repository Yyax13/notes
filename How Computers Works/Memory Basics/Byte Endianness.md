---
publish: true
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

A nibble is half of this table, in the example we have two different nibbles: the High Nibble and the Low Nibble. The High Nibble is the group of the four most significant bits (well known as MSBs), the Low Nibble otherwise is the group of the four least significant bits (aka LSBs).

The concept of MSB/LSB measures how significant a bit is, so you might be asking, how can we know how significant a bit is? and that's simple, for a higher exponent higher is the bit even if it's value is $0$. Since every bit has it's decimal representation in the scale of being a power of two, so the rule is, the $n$ bit from right to left is $2^{n-1}$, so the 8th bit has the value of $2^7$, $128$. This can stack infinitely, but commonly we stack it in a power of two under 64 bits, so generally you'll see stacks of 8 bits, 16 bits, 32 bits and 64 bits the are, respectively, a byte, a 16-bits word, a integer and a 64-bits word.

# So, What is Byte Endianness

Byte Endianness is a bigger implementation of Nibbles, we split the word, whether 8; 16; 32; or even 64 bits length, into two groups, each one with half of the bytes of the word, the MSBytes (different that MSBs, that refers to bits) and LSBytes. The MSBytes are the most significant half (i.e., in a 32-bits word, an integer, the 7th to the 15th bits are the most significant bits, that compose the most significant half).

---

# Refs

> Byte Endianness
> > [Wikipedia](https://en.wikipedia.org/wiki/Endianness)
> > [ChatGPT](https://chatgpt.com/share/6a5141e6-b74c-83e9-8788-2f33efc0381d)
> > [ChatGPT](https://chatgpt.com/share/6a51421c-6894-83e9-ad29-d294a9556ea7)
> Nibbles
> > [Wikipedia](https://en.wikipedia.org/wiki/Nibble)