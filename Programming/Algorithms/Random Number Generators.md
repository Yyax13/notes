---
tags:
  - unfinished
publish: true
---
# Introduction

Random number generating is a practice that creates random data. The most common way to generate random-sh numbers is the _PRNG_ (_Pseudo-Random Number Generator_) and the _CSPRNG_ (_Photographically-Secure Pseudo-Random Number Generator_).

# The Development Framework

The framework for every algorithm in this article will be in [my GitHub](https://github.com/Yyax13/RNG_Collection). If you want to read the full implementation (benchmarks and others), check the repository.

# PRNG Algorithms: An Overview

For generating PRNGs, the algorithm is mostly simple, at least in common PRNG algorithms, as CSPRNGs're much more complex. In this note we'll study the `LCG `, the `xorshift` (and  the `+`/`*` versions), the `SplitMix64` and the `Xoshiro256**`. After a brief overview, we'll develop our own algorithm (I'll name it as `uwu32`) and optimize it to pass `64GB PractRand` test with up to `2GB/s throughput`.

## The LCG

The LCG (Linear Congruential Generator) is a PRNG algorithm. The pseudo-random numbers are calculated using a [[Piecewise Functions|Piecewise Linear Function]]. The generator is defined by the following [[Recurrence Relation]]:

$$
X_{n+1} = (aX_{n} + c) \bmod m
$$

Where

- $X$ is the pseudo-random sequence;
- $m$ is the value for the modulo operation (commonly `%` in programming languages), where $0 < m$;
- $a$ is the multiplier, where $0 < a < m$;
- $c$ is the increment, where $0 \leq c < m$;
- $X_0$ is the seed, the initial value where $0 \leq X_0 < m$.

### The LCG Period

The period of a linear congruential generator is capped at $m$. If the generator has a complete period, every value up to $m - 1$ will be generated, after $m$ numbers generated the values will cycle and repeat. The generator will only have a complete period if, and only if:

- $m$ and $c$ being relatively prime integers;
- $a - 1$ being divisible by every prime factor of $m$;
- $a - 1$ being divisible by $4$ if $m$ is divisible by $4$ too.

### LCG Variations

The LCG can be both a multiplicative and a mixed algorithm, the rule is simple, if $c = 0$ the LCG is multiplicative, else it is a mixed LCG.

Some examples of mixed LCGs are the old `rand()` from the _[libc](https://www.gnu.org/software/libc/)_ or the old Visual C++ implementation. Although the multiplicative way is much more common, I choose the _Park and Miller_ to use as an example of constants $c$, $a$ and $m$.

| Implementation      | $a$          | $c$          | $m$          |
| ------------------- | ------------ | ------------ | ------------ |
| _libc_ `rand()`     | $1103515245$ | $12345$      | $2147483648$ |
| old Visual C++      | $1664525$    | $1013904223$ | $4294967296$ |
| Park and Miller \#3 | $69621$      | $0$          | $2147483647$ |

### An Implementation in C++

Of course we can implement this simple algorithm in C++, for this I'll firstly create a class called `LCG` and a proper `main` function to test both mixed LCG and multiplicative LCG.

```cpp
#pragma once

#include <cstdint>

class LCGInstance {
  private:
    uint64_t seed = 0;
    const uint64_t a;
    const uint64_t c;

  public:
    LCGInstance(uint64_t s, uint64_t _a, uint64_t _c) : seed(s), a(_a), c(_c) {}
    uint64_t next() {
	    // Here we don't use the m constant
	    // we expects the language to do
	    // an equivalent operation whithin
	    // the type overflow.
        seed = (a * seed + c);
        return seed;
    }
};
```

This implementation let us test both multiplicative and mixed algorithms, just using an specific argument. You can compile the program using:

```bash
g++ -I. LCG.cpp -o lcg
```

### LCG Benchmark: Hidden Problems Identified

To benchmark the algorithm, we'll use [PractRand](https://sourceforge.net/projects/pracrand/) until 8GB of output.


| Algorithm | 256 MB | 512 MB | 1 GB | 2 GB | 4 GB | 8 GB |
| --------- | ------ | ------ | ---- | ---- | ---- | ---- |
| Mix       | Failed | N/A    | N/A  | N/A  | N/A  | N/A  |
| Mul       | Failed | N/A    | N/A  | N/A  | N/A  | N/A  |

Yeah, the algorithm sucks, and this is expected, here're the reasons why it failed: 

1. __Low bits are limited__: The algorithm implementation (purely) don't mix the state, so the low bits have limited period, so for $k$ bits, the period cap is $2^k$ and that's why most failures was `[LowK/64]`, the state:

| __Bits__       | $1$ | $2$ | $4$  | $8$   | $16$    | $32$         |
| -------------- | --- | --- | ---- | ----- | ------- | ------------ |
| __Max Period__ | $2$ | $4$ | $16$ | $256$ | $65536$ | $4294967296$ |

Although $2^{32}$ looks big, but for testing, the PractRand can detect the linear correlation without even touching every bit.

2. __The state is a hyperplane__: Imagine consecutive pairs, which every pair represent a dot in a two dimensional plane, like $(X_n, X_{n+1})$, because $X_{n+1} = aX_n + c$, every dots get stuck in a line. In three dimensions $(X_n, X_{n+1}, X_{n+2})$, they get stuck in plans. In more dimensions the dots get stuck in _Hyperplans_, according to the _[Marsaglia's Theorem](https://en.wikipedia.org/wiki/Marsaglia%27s_theorem)_, which proves that for a LCG generated dot in a $n$ dimensions plane, falls into a small number of parallel hyperplanes.

![[The Marsaglia's Hyperplane Theorem with RANDU.png]]
> Three-dimensional plot of 100,000 values generated with RANDU. Each point represents 3 consecutive pseudorandom values. It is clearly seen that the points fall in 15 two-dimensional planes.

![[Marsaglia_plot_lcg_unmixed.png]]
> Three-dimensional plot of 25.000 values generated by our algorithm.


### Fixing the algorithm

Our algorithm isn't bad, but we need to mix the output to get higher entropy, swap low-to-high bits and reduces the state correlation

---

# Refs

> The LGC
> > [Wikipeda](https://pt.wikipedia.org/wiki/Geradores_congruentes_lineares)
> > [Wikipedia](https://en.wikipedia.org/wiki/Linear_congruential_generator#LCG_derivatives)