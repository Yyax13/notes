---
publish: true
tags:
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

## `timespec_get` Demonstration

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
        printf("==== Nanosseconds: \t %ld\n", ts.tv_nsec);
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
> Source code available at https://github.com/Yyax13/tests/tree/1d434bbb8403a057aa101cf16c4191214f728396/testesemc/timespec-gets

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

If everything runs successfully the output'll be something like this:

```
[9ms][main][~/Projects/Tests/testesemc/timespec-gets] :) ./main thread
== timespec demonstration

== Thread time (with TIME_THREAD_ACTIVE):
==== Thread 1: 		0.000024191
==== Thread 2: 		0.000016060
==== Thread 3: 		0.000015894
==== Thread 4: 		0.000014615
==== Thread 5: 		0.000005737
==== Thread 6: 		0.000009639
==== Thread 7: 		0.000004764
==== Thread 8: 		0.000007758
[8ms][main][~/Projects/Tests/testesemc/timespec-gets] :) 
```

### 3. Active Time

The CPU time is obtained by using the [[#TIME_ACTIVE]] `int base` in the `timespec_get` function, it will result in the total process time. The source code responsible for this section is:

```c
if (mode.active) {
    timespec_get(&ts, TIME_ACTIVE);

    printf("\n== Active time (with TIME_ACTIVE):\n");
    printf("==== Seconds: \t\t %ld\n", ts.tv_sec);
    printf("==== Nanosseconds: \t %ld\n", ts.tv_nsec);
}
```

It's simple, barely the same code that found in the [[#1. Current Time]] section. Just get the current time using [[#TIME_ACTIVE]] as `int base` and print the result.

### 4. Monotonic

The monotonic example is split over two files and functions, the first one is responsible for actually obtaining the two `timespec` instances via `timespec_get`. The second one is responsible for doing the diff math.

The source code for the main snippet is:

```c
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
```

The second function, `timespec_diff` is defined in the `helper.h` file and is responsible for actually doing the math under the hood:

```c
static struct timespec timespec_diff(struct timespec start,
                                     struct timespec end) {
    struct timespec diff = {.tv_sec = end.tv_sec - start.tv_sec,
                            .tv_nsec = end.tv_nsec - start.tv_nsec};

    if (diff.tv_nsec < 0) {
        diff.tv_sec--;
        diff.tv_nsec += 1000000000L;
    }

    return diff;
}
```

You might be asking about the $10^9$ (`1000000000L`), because the theoretical limit $\{x \in \mathbb{Z} \mid 0 \leq x < 10^9\}$. Actually the math is correct, the increment in `tv_nsec` by $10^9$ isn't executed out of the if statement that checks for negative values (as it isn't unsigned). Let's take an example:

1. The result of `end.tv_nsec - start.tv_nsec` is $-1234$ nanoseconds;
2. The if statement subtracts a second of the `diff.tv_sec`;
3. The `diff.tv_nsec` becomes $999998766$.

So the `timespec` with a negative `tv_nsec` become standardized: from $2$ seconds and $-1234$ nanoseconds to $1.999998766$ seconds.

There is no fail checks in the monotonic example, so the output will ever be something like:

```
[12ms][main][~/Projects/Tests/testesemc/timespec-gets] :) ./main mono
== timespec demonstration

== Monotonic time (with TIME_MONOTONIC):
==== Monotonic A: 	1732.849582898
==== Monotonic B: 	1732.849591668
==== Difference: 	0.000008770
[11ms][main][~/Projects/Tests/testesemc/timespec-gets] :) 
```

### 5. Overall

The default execution of our example is:

```
[15ms][main][~/Projects/Tests/testesemc/timespec-gets] :) ./main
== timespec demonstration

== Current time (with TIME_UTC):
==== Seconds: 		1793207676
==== Nanosseconds: 	341851430


== Thread time (with TIME_THREAD_ACTIVE):
==== Thread 1: 		0.000041172
==== Thread 2: 		0.000011232
==== Thread 3: 		0.000012457
==== Thread 4: 		0.000016102
==== Thread 5: 		0.000009982
==== Thread 6: 		0.000007024
==== Thread 7: 		0.000009144
==== Thread 8: 		0.000005297

== Active time (with TIME_ACTIVE):
==== Seconds: 		0
==== Nanosseconds: 	1149134

== Monotonic time (with TIME_MONOTONIC):
==== Monotonic A: 	1786.314696077
==== Monotonic B: 	1786.314700538
==== Difference: 	0.000004461
[8ms][main][~/Projects/Tests/testesemc/timespec-gets] :)
```

We can also combine different demonstrations in one execution:

```
[10ms][main][~/Projects/Tests/testesemc/timespec-gets] :) ./main "time|active"
== timespec demonstration

== Current time (with TIME_UTC):
==== Seconds: 		1793207716
==== Nanosseconds: 	372878672


== Active time (with TIME_ACTIVE):
==== Seconds: 		0
==== Nanosseconds: 	1214476
[11ms][main][~/Projects/Tests/testesemc/timespec-gets] :)
```

This is the usage helper:

```
Usage: ./main <mode(s)>

mode:
	time 	- Current time
	thread 	- Thread CPU Time
	active 	- Process CPU Time
	mono 	- Monotonic timespec

Example:
	./main "time|mono"
```

## `timespec_getres` Demonstration

There isn't much about the [[#`timespec_getres`|timespec_getres]] example, it's a very simple Proof of Concept of how the function works. The source code is:

```c
#include <stdio.h>
#include <time.h>

int main() {
    printf("== Timer resolution test\n\n");

    struct timespec ts;
    if (timespec_getres(&ts, TIME_UTC) == TIME_UTC) {
        printf("== Timer resolution (s): %ld.%09ld\n", ts.tv_sec, ts.tv_nsec);
        printf("== Timer resolution (ns): %ld\n", ts.tv_nsec);
    } else {
        printf("Can't get timer resolution");
        return 1;
    }

    return 0;
}
```
> Source code available at https://github.com/Yyax13/tests/tree/1d434bbb8403a057aa101cf16c4191214f728396/testesemc/timespec-res (same as [[Timestamp Resolution#Example with `timespec_getres`|this example]] btw)

Literally just get the resolution and print it to the stdout.

## `nanosleep` Demonstration

The [[#`nanosleep`|nanosleep]] example is also simple, it combines the [[#4. Monotonic|monotonic example]] and error handling across multiple nanosleep calls. The source code is:

```c
#include <stdio.h>
#include <time.h>

struct timespec timespec_diff(struct timespec *start, struct timespec *end) {
    struct timespec diff = {.tv_sec = end->tv_sec - start->tv_sec,
                            .tv_nsec = end->tv_nsec - start->tv_nsec};

    if (diff.tv_nsec < 0) {
        diff.tv_sec -= 1;
        diff.tv_nsec += 1e9L;
    }

    return diff;
}

int main() {
    printf("== Nanosleep Demonstration\n");

    struct timespec start, end, diff;
    struct timespec rem, sleep = {.tv_sec = 3, .tv_nsec = 5e8};

    timespec_get(&start, TIME_MONOTONIC);
    int res = nanosleep(&sleep, &rem);
    if (res == -1) {
        perror("Retrying sleep");
        if ((res = nanosleep(&rem, NULL)) == -1) {
            perror("Can't sleep");
            return 1;
        }
    }

    timespec_get(&end, TIME_MONOTONIC);
    diff = timespec_diff(&start, &end);
    printf("==== Target sleep time: %ld.%09ld seconds\n", sleep.tv_sec,
           sleep.tv_nsec);
    printf("==== Slept for %ld.%09ld seconds\n", diff.tv_sec, diff.tv_nsec);

    return 0;
}
```
> Source code available at https://github.com/Yyax13/tests/blob/1d28228d75132eca6edbc11fbde4bf9ec7d98d39/testesemc/timespec-nanosleep/main.c

Again we have the `timespec_diff` that was already explained in [[#4. Monotonic|this section]]. The main function logic is pretty simple, firstly we create three `struct timespec` uninitialized instances:

1. `start`: The start argument for the monotonic comparison;
2. `end`: The end argument for the same comparision;
3. `diff`: The instance responsible for storing the difference between `start` and `end`.

Then the nanosleep-related instances:

1. `rem`: Stands for `remaining timespec`, as described in [[#`nanosleep`|the nanosleep section]] it'll store the remaining time if something stops the sleeping, so the user can call nanosleep again with this `remaining timespec`;
2. `sleep`: Time we want to the process to sleep, placed after the rem because the initialization precedence (the last argument is initialized).

Then we assign the returning value of `nanosleep(&sleep, &rem)` to `int res` (stands for result). The new `res` integer is checked for the error returning value `-1`, if so, we alert the user and retry using the `struct timespec rem` as the new sleep, and setting the new sleep remaining argument to `NULL` (as it's null-able). 

After this, we subtract the `start` with `end` on `diff` and print two data: the target sleep time and the actual time the program slept. The expected output for a normal error-less execution is:

```
[7ms][main][~/Projects/Tests/testesemc/timespec-nanosleep] :) ./main
== Nanosleep Demonstration
==== Target sleep time: 3.500000000 seconds
==== Slept for 3.500114023 seconds
[3,516s][main][~/Projects/Tests/testesemc/timespec-nanosleep] :)
```

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

The function return the `int base` if it's supported, otherwise returns zero (`0`). Normally we use the [[#TIME_UTC]] as the `int base`, there is an example of it in [[Timestamp Resolution#Example with `timespec_getres`|this note]], you may want to take a look on it. 

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

-  [[POSIX Clocks - A Clock and Timing API]] (unavailable yet)

# Refs

> `timespec`
> > [GLIBC Source Code](https://sourceware.org/git/?p=glibc.git;a=blob;f=time/time.h;h=ae7beccb72268a998c4439dcfd6238ce7c0197e3;hb=HEAD)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec_getres)
> > [C++ Reference](https://en.cppreference.com/c/chrono/timespec_get)