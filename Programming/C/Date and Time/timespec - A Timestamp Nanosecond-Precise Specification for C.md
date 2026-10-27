---
publish: true
tags:
  - unfinished
---
# Introduction

The `timespec`  structure, defined in `<time.h>` ISO C header, is used to store timestamps with nanoseconds precision (one second is $10^9$ nanoseconds). It's prototype is:

```c
struct timespec
{
#ifdef __USE_TIME64_REDIRECTS
    __time64_t tv_sec;      /* Seconds.  */
#else
    __time_t tv_sec;        /* Seconds.  */
#endif
#if __WORDSIZE == 64 \
    || (defined __SYSCALL_WORDSIZE && __SYSCALL_WORDSIZE == 64) \
    || (__TIMESIZE == 32 && !defined __USE_TIME64_REDIRECTS)
    __syscall_slong_t tv_nsec;  /* Nanoseconds.  */
#else
# if __BYTE_ORDER == __BIG_ENDIAN
    int: 32;           /* Padding.  */
    long int tv_nsec;  /* Nanoseconds.  */
# else
    long int tv_nsec;  /* Nanoseconds.  */
    int: 32;           /* Padding.  */
# endif
#endif
};
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/bits/types/struct_timespec.h;h=1141015f276cb33032a6d4ec70d5d73ec2c21d55;hb=HEAD

A shorter and cleaner API-like structure would be:

```c
struct timespec {
	time_t tv_sec;
	long   tv_nsec;
};
```

The `tv_nsec` is an implementation-defined signed integer type that can represent integers following $\{x \in \mathbb{Z} \mid 0 \leq x < 10^9\}$.

# Examples

## `timespec_get`

The [[#`timespec_get`|timespec_get API Lookup]] document the API, so read this section first and then come here to the example. I wrote it in C using `time.h` and `threads.h` (to simulate threads running to achieve individual [[#TIME_THREAD_ACTIVE|thread CPU time]]).

I split the code in two files: the `main.c` containing the logic and the `helper.h` that defines the argument parsing and the `timespec_diff` function (easy `timespec` difference calculating for the [[#TIME_MONOTONIC|monotonic]] example). Here is the `main.c` code:

```c
#include "helper.h"
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <threads.h>
#include <time.h>

#ifndef WORKER_COUNT
#define WORKER_COUNT 8
#endif

struct worker_t {
    int id;
};

int worker_f(void *arg) {
    if (arg == NULL)
        return 1;

    struct worker_t self = *(struct worker_t *)(arg);

    struct timespec ts;
    timespec_get(&ts, TIME_THREAD_ACTIVE);

    printf("==== Thread %d: \t\t %ld.%09ld\n", self.id, ts.tv_sec, ts.tv_nsec);
    return 0;
}

int main(int argc, char *argv[]) {
    struct poc_mode_t mode = MODE_FULLY_FALSE;
    if (argc > 1) {
        if (argc > 2) {
            printf("Usage: %s <mode(s)>\n\n"
                   "mode:\n"
                   "\ttime \t - Current time\n"
                   "\tthread \t - Thread CPU Time\n"
                   "\tactive \t - Process CPU Time\n"
                   "\tmono \t - Monotonic timespec\n"
                   "\n"
                   "Example:\n"
                   "\t%s \"time|mono\""
                   "\n",
                   argv[0], argv[0]);

            return 1;
        }

        mode = getMode(getArgs(argv[1]));
    } else
        mode = MODE_FULLY_TRUE;

    printf("== timespec demonstration\n");
    struct timespec ts;

    if (mode.time) {
        timespec_get(&ts, TIME_UTC);

        printf("\n== Current time (with TIME_UTC):\n");
        printf("==== Seconds: \t\t %ld\n", ts.tv_sec);
        printf("==== Nanosseconds: \t %ld\n\n", ts.tv_nsec);
    }

    if (mode.threadActive) {
        printf("\n== Thread time (with TIME_THREAD_ACTIVE):\n");

        const size_t workersCount = WORKER_COUNT;
        struct worker_t workers[workersCount];
        thrd_t threads[workersCount];

        for (int i = 0; i < workersCount; i++) {
            workers[i] = (struct worker_t){.id = i + 1};
            if (thrd_create(&threads[i], worker_f, &workers[i]) !=
                thrd_success) {
                printf("Can't create thread %d\n", i);
                return 1;
            }
        }

        for (int i = 0; i < workersCount; i++) {
            if (thrd_join(threads[i], NULL) != thrd_success) {
                printf("Can't join the thread %d\n", i);
                return 1;
            }
        }
    }

    if (mode.active) {
        timespec_get(&ts, TIME_ACTIVE);

        printf("\n== Active time (with TIME_ACTIVE):\n");
        printf("==== Seconds: \t\t %ld\n", ts.tv_sec);
        printf("==== Nanosseconds: \t %ld\n\n", ts.tv_nsec);
    }

    if (mode.mono) {
        timespec_get(&ts, TIME_MONOTONIC);
        printf("\n== Monotonic time (with TIME_MONOTONIC):\n");
        printf("==== Monotonic A: \t %ld.%09ld\n", ts.tv_sec, ts.tv_nsec);

        struct timespec tsB;
        timespec_get(&tsB, TIME_MONOTONIC);
        printf("==== Monotonic B: \t %ld.%09ld\n", tsB.tv_sec, tsB.tv_nsec);

        struct timespec diff = timespec_diff(ts, tsB);
        printf("==== Difference: \t %ld.%09ld\n", diff.tv_sec, diff.tv_nsec);
    }

    return 0;
}
```

The working is simple and can be split between four main pieces:

### 1. Current Time

The current time uses [[#TIME_UTC]] as the `int base` argument for the `timespec_get` function, then it prints the result:

```C
if (mode.time) {
    timespec_get(&ts, TIME_UTC);

    printf("== Current time (with TIME_UTC):\n");
    printf("==== Seconds: \t\t %ld\n", ts.tv_sec);
    printf("==== Nanosseconds: \t %ld\n\n", ts.tv_nsec);
}
```

It's output is:

```
[11ms][main][~/Projects/Tests/testesemc/timespec-gets] :) ./main time
== timespec demonstration

== Current time (with TIME_UTC):
==== Seconds: 		1793133213
==== Nanosseconds: 	82798713

[9ms][main][~/Projects/Tests/testesemc/timespec-gets] :) 
```

### 2. Thread Active

The thread active time implementation uses a more complex logic: the main caller, a `worker_f` function and workers context. The `worker_f` function is responsible of actually getting the thread active time and printing it:

```c
// Structure used to assign each worker it's own ID
struct worker_t {
    int id;
};

int worker_f(void *arg) {
    if (arg == NULL)
        return 1;

    struct worker_t self = *(struct worker_t *)(arg);

    struct timespec ts;
    timespec_get(&ts, TIME_THREAD_ACTIVE);

	// Here we uses the %09ld specifier to ensure all the nine
	// digits of ns field, fallback to zeros inserted in the left
    printf("==== Thread %d: \t\t %ld.%09ld\n", self.id, ts.tv_sec, ts.tv_nsec);
    return 0;
}
```

The `worker_f` logic is simple, it casts the `void *arg` to itself's self structure, get the [[#TIME_THREAD_ACTIVE]] and prints everything.

The main logic is a bit more complex, because it handles the workers (using the [[thrd_t - A simple parallel threading API|thrd_t]] API) and assigns each one it's own context structure:

```c
if (mode.threadActive) {
    printf("\n== Thread time (with TIME_THREAD_ACTIVE):\n");

    const size_t workersCount = WORKER_COUNT;
    struct worker_t workers[workersCount];
    thrd_t threads[workersCount];

    for (int i = 0; i < workersCount; i++) {
        workers[i] = (struct worker_t){.id = i + 1};
        if (thrd_create(&threads[i], worker_f, &workers[i]) !=
            thrd_success) {
            printf("Can't create thread %d\n", i);
            return 1;
        }
    }

    for (int i = 0; i < workersCount; i++) {
        if (thrd_join(threads[i], NULL) != thrd_success) {
            printf("Can't join the thread %d\n", i);
            return 1;
        }
    }
}
```

It starts by initializing two arrays in the stack, using indirectly the `WORKER_COUNT` macro, one to store the workers self context and the other one to stores the `thrd_t` instances per-worker. Then the first loop starts every worker context and `thrd_t` instance. The second loop uses [[thrd_t - A simple parallel threading API#`thrd_join`|thrd_join]] to wait for each thread.

# API Lookup

## Macros

### TIME_UTC

The `TIME_UTC` macro is used as a mode for the [[#`timespec_get`|timespec_get]] and other time-related functions (like [[#`timespec_getres`|timespec_getres]]), to determinate what'll be the initial value assigned to the pointed `timespec` instance. It's defined by default in the C11 specification and it's definition is:

```C
# define TIME_UTC 1
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l69

When you use it, the assigned `timespec` instance value is set to the current timestamp following the POSIX epoch standard.

### TIME_MONOTONIC

The `TIME_MONOTONIC` macro is also used in timespec-related functions, however it do not set the `timespec` value to a useful timestamp, it works by assigning the time since a reference point (unknown, arbitrary and implementation-defined) as the `timespec` struct instance. Then you probably want to compare two `timespec` instances to check how much time passed. It's definition is:

```c
# define TIME_MONOTONIC          2
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l72

> [!NOTE]
> The `TIME_MONOTONIC` isn't a C11 standard macro, but it's a GNU C library extension macro. It's not portable across C implementations.

### TIME_ACTIVE

The `TIME_ACTIVE` macro is also used in timespec-related functions (like [[#`timespec_get`|timespec_get]]), it's assigned value is the total process time:

```
			    ┌─────────────────────────────────────────────┐
			    │                Process #0001                │
			    │┌───────────────────┐   ┌───────────────────┐│
			    ││Thread #0001       │   │Thread #0003       ││
			    ││Thread Time: 0,8s  │   │Thread Time: 0,6s  ││
			    │└───────────────────┘   └───────────────────┘│
			    │┌───────────────────┐   ┌───────────────────┐│
			    ││Thread #0002       │   │Thread #0004       ││
			    ││Thread Time: 0,4s  │   │Thread Time: 1,4s  ││
			    │└───────────────────┘   └───────────────────┘│
			    │                 Active Time                 │
			    │                     3,2s                    │
			    └─────────────────────────────────────────────┘
```

The macro definition is:

```c
# define TIME_ACTIVE             3
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l73

> [!NOTE]
> The `TIME_ACTIVE` isn't a C11 standard macro, but it's a GNU C library extension macro. It's not portable across C implementations.

### TIME_THREAD_ACTIVE

The `TIME_THREAD_ACTIVE` measures the CPU Time used by it's caller thread. It works likely as [[#TIME_ACTIVE]] but measuring just the current thread. It's definition is:

```c
# define TIME_THREAD_ACTIVE      4
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l74

## Functions
### `timespec_get`

The `timespec_get` function is used to fill a `struct timespec` instance with data. It's prototype is:

```c
extern int timespec_get (struct timespec *__ts, int __base)
	 __THROW __nonnull ((1));
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l392

Or simply

```c
int timespec_get(struct timespec *ts, int base)
```

The `int base` parameter must be one of the [[#Macros]]. The returning integer can be used to verify the operation success: if `return == 0` the call failed, return `int base` otherwise.

### `timespec_getres`

The `timespec_getres` function is responsible for getting the [[Timestamp Resolution]]. It's C-native since the C23 standard, so it may not work with older standards (like C11 or C99). The function prototype is:

```c
extern int timespec_getres (struct timespec *__ts, int __base)
	 __THROW;
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l408

Or simply

```c
int timespec_getres(struct timespec* ts, int base);
```

The function return the `int base` if it's supported, otherwise returns zero (`0`). Normally we use the [[#TIME_UTC]] as the `int base`, there is an example of it in [[Timestamp Resolution#POSIX Example with `timespec_getres`|this note]], you may want to take a look on it. 

### `nanosleep`

The `nanosleep` function is used to sleep a program with nanoseconds precision. It's prototype is:

```c
extern int nanosleep (const struct timespec *__requested_time,
		      struct timespec *__remaining);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD#l290

Or simply

```c
int nanosleep(const struct timespec *duration,
              struct timespec *_Nullable rem)
```

The `struct timespec *duration` parameter defines the target duration. The returning integer will be `0` if the program sleeps normally, otherwise `-1` will be returned and `errno` will be set. There're two possible errno values after an error:

1. `EINTR`: The process was interrupted by a signal;
2. `EINVAL`: The `struct timespec *duration` argument specified a `tv_nsec` property out of the mathematically allowed group $\{x \in \mathbb{Z} \mid 0 \leq x < 10^9\}$ ($x$ being a integer equals or bigger than $0$ and smaller than $10^9$, basically $x = [0,999.999.999]$).

If the program don't finish the sleep, the `struct timespec *rem` parameter will be filled with the remaining time to sleep (if it's not `NULL`) so the program can call nanosleep again using the `struct timespec *rem` as the target duration.

---
# Related

-  [[POSIX Clocks - A Clock and Timing API]]

# Refs

> `timespec`
> > [GLIBC Source Code](https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec_getres)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec_get)