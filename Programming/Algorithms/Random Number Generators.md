---
tags:
  - unfinished
publish: true
---
# Introduction

Random number generating is a practice that creates random data. The most common way to generate random-sh numbers is the _PRNG_ (_Pseudo-Random Number Generator_) and the _CSPRNG_ (_Photographically-Secure Pseudo-Random Number Generator_).

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
	    // we expects the language to to
	    // an equivalent operation when the
	    // type overflow.
        seed = (a * seed + c);
        return seed;
    }
};
```

And it's `.cpp` file:

```cpp
#include "LCG.h"
#include <cstdint>
#include <cstdio>
#include <string>
#include <unistd.h>

LCGInstance *LCGMul;
LCGInstance *LCGMix;

void init() {
    LCGMul = new LCGInstance(0x1A4B92C8F3D69421, 0xda942042e4dd58b5ULL, 0);
    LCGMix = new LCGInstance(0x1A4B92C8F3D69421, 6364136223846793005ULL,
                             1442695040888963407ULL);
}

int usage(char *argv0) {
    printf("LCG Implementation by hoWo"
           "\n"
           "Usage:\n\t%s <mode>"
           "\n\n"
           "\t<mode>:"
           "\n"
           "\t\t\tmul\t- Multiplicative LCG"
           "\n"
           "\t\t\tmix\t- Mixed LCG\n",
           argv0);

    return 0;
}

int main(int argc, char *argv[]) {
    init();
    LCGInstance *func = NULL;

    if (argc < 2)
        return usage(argv[0]);

    std::string mode = argv[1];

    if (mode != "mul" && mode != "mix")
        return usage(argv[0]);

    func = mode == "mul" ? LCGMul : LCGMix;

    while (true) {
        uint64_t v = func->next();
        fwrite(&v, sizeof(v), 1, stdout);
    }

    return 0;
}
```

This implementation let us test both multiplicative and mixed algorithms, just using an specific argument. You can compile the program using:

```bash
g++ -I. LCG.cpp -o lcg
```

### LCG Benchmark

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

3. __The Linear Correlation Problem__: The state evolves linearly

```desmos-graph
xs = [1722827044408533139,6057719119613110863,3107969515369244788,13978663452515114036,3655308624082740440,12901638717760600394,4773033198840355958,1763608784605128887,7549749103894247174,12750628938036582087,5772280801605934862,9472913836787134870,4747826092498473268,14470122286440683488,14306276162789489013,2706912070390786418]
ys = [14189532893044719606,4403486409891222160,40830321068305200,17644147745847270675,5375632666303620235,12714359518652263219,2822248662582709829,4781593262576314714,16748044029494671692,13823136397402875733,6042119653691610957,16813023460151874689,5482012320112219904,6410364345715418085,6031022529130860178,12491959023402285942]

ys ~ m xs + b  
  
r = correlation(xs,ys)
```

---

# Refs

> The LGC
> > [Wikipeda](https://pt.wikipedia.org/wiki/Geradores_congruentes_lineares)
> > [Wikipedia](https://en.wikipedia.org/wiki/Linear_congruential_generator#LCG_derivatives)