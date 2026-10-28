---
tags:
  - unfinished
publish: true
---
# mtx_t - A simple C mutex API

The `mtx_t`, defined at `<threads.h>` (same as [[thrd_t - A simple parallel threading API|thrd_t]]), is a "lock" that prevents race conditions by blocking the access to critical resources between parallel or concurrent threads. It's a C11 compliant API that ports the NPTL `pthread_mutex_t`, as a opaque type (you NEVER looks inside it for nothing, it's implementation-defined and NOT portable).

# Introduction

A `mtx_t` is the type behind the C11 mutex API (defined at `threads.h`, g/libc), roughly a mutex is needed to prevent a race condition when multiple threads has to update the same variable. `mtx_t` itself is built around the `pthread_mutex_t` as a adaptation to the C11 API style. 

It works in three steps:

## 1st Step: Init the mutex

In this API we use `mtx_init` function (unlike pthreads, a `mtx_t` instance must be initialized in runtime), defined by the prototype:

```c
extern int mtx_init (mtx_t *__mutex, int __type);
```
   
The `mtx_t *mtx` field must be a pointer to your `mtx_t` instance. You should keep this aware of stack OR pass it through functions context, commonly created as structures, (`struct`) and then passed as pointers to other functions (if we're talking about threads, mainly `thrd_t`, you should pass it in `thrd_create` as `void *arg` and then validate it's nullity and proper cast to your context struct).
   
The `int type` must be filled with one of this three constants:
   
1. **`mtx_plain`**: Non-recursive lock, so locking it twice in the same thread deadlocks it (infinite waiting for unlocking, but it never happens because it'self blocked it);
2. **`mtx_recursive`**: Recursive lock, the same thread can lock it multiple times. Every lock must be released or it'll deadlock.;
3. **`mtx_time`**: Same as `mtx_plain` but with `mtx_timedlock` support.
   
If you set it to any unsupported value, it'll fallback to `mtx_plain` by default. You can also combine it (using the pipe operator, `|`), all valid combinations are:


| Combination                    | Behavior                                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw `mtx_plain`                | Default mutex, no recursivity and no timeout support                                                                                            |
| Raw `mtx_recursive`            | Unsupported according to the documentation,<br>logically supported (check [[mtx_t - A simple C mutex API#`mtx_t` Modes\|this section]]) in NPTL |
| Raw `mtx_timed`                | Default mutex with timeout support, no recursivity                                                                                              |
| `mtx_plain` \| `mtx_timed`     | Default mutex with timeout support, same as `mtx_timed`                                                                                         |
| `mtx_plain` \| `mtx_recursive` | Recursive mutex without timeout support                                                                                                         |
| `mtx_timed` \| `mtx_recursive` | Recursive mutex with timeout support                                                                                                            |

The [[mtx_t - A simple C mutex API#`mtx_t` Modes|modes section]] provides a cleaner explaining.

After calling the `mtx_init` you should also check for errors:

```c
#include <threads.h>
#include <stdio.h>

int main(void) {
	mtx_t mu;
	if (mtx_init(&mu, mtx_plain) != thrd_success) {
		printf("Can't init mutex\n");
		return 1;
	}
	
	/** Use the mutex **/
	
	mtx_destroy(&mu);
	return 0;	
}
```

## 2nd Step: Lock it

There is multiple ways to acquire a mutex, everyone depending on your mutex mode:

| How to acquire        | Behavior                                                                                                                                                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Using `mtx_lock`      | This is a blocking lock, if the mutex is already blocked it can  deadlock, depending on the mutex mode (if it's `mtx_recursive` or any derivations, you can lock the thread multiple times in the same thread).                                                                                           |
| Using `mtx_timedlock` | Although it's also a blocking lock, the caller can define a target timestamp (using the [[timespec - A Timestamp Nanosecond-Precise Specification for C\|timespec]] structure, defined at `<time.h>`) that works as a deadline/timeout (If $\texttt{current time } \geqslant \texttt{ target timespec}$, it gives up trying to lock). |
| Using `mtx_trylock`   | Attempts locking the mutex and if it's already locked return an error `thrd_busy` (any other code that isn't `thrd_success` means error).                                                                                                                                                                 |

In the `mtx_timedlock` and `mtx_trylock` you shall check for different errors that follows the [[thrd_t - A simple parallel threading API#`thrd_t` Success Enumeration Constant|thrd_t Success Enum]], unlikely `mtx_lock` that just returns `thrd_error` if any error happens.

| Lock Function   | Error value     | Error cause                                    |
| --------------- | --------------- | ---------------------------------------------- |
| `mtx_lock`      | `thrd_error`    | Any error can cause this.                      |
| `mtx_timedlock` | `thrd_timedout` | The timeout `timespec` reaches it's own limit. |
| `mtx_trylock`   | `thrd_busy`     | The lock is busy.                              |

All three functions can return `thrd_error` but the specific errors per-function isn't universal, so `mtx_lock` won't return `thrd_timedout` but `mtx_timedlock` can always return `thrd_error` for generalist errors.

## 3rd Step: Destroy the mutex

After using the mutex freely you must always destroy it using the [[#`mtx_destroy`|mtx_destroy]] function.

# Examples

## Mutexes Usage

Single-threaded example-only usage guide:

```c
#include <stdio.h>
#include <threads.h>
#include <time.h>

int main(void) {
    mtx_t mu;
    int sensitive_variable = 1337;
    printf("Sensitive Variable: %d\n", sensitive_variable);
	
    if (mtx_init(&mu, mtx_plain | mtx_timed) != thrd_success) {
        printf("Can't init mutex\n");
        return 1;
    }
	
    // trylock example
    switch (mtx_trylock(&mu)) {
        case thrd_success: {
            sensitive_variable += 1;
            printf("Sensitive Variable: %d\n", sensitive_variable);
			
            mtx_unlock(&mu);
        } break;
        case thrd_busy: {
            printf("Can't trylock mutex: Mutex &mu is already locked");
        } break;
        default: {
            printf("Can't trylock mutex: Some error happened");
        } break;
    }
	
    // timedlock example
    struct timespec ts;
    timespec_get(&ts, TIME_UTC);
	
    // Add 5s to timer
    ts.tv_sec += 5;
    switch (mtx_timedlock(&mu, &ts)) {
        case thrd_success: {
            sensitive_variable += sensitive_variable;
            printf("Sensitive Variable: %d\n", sensitive_variable);
			
            mtx_unlock(&mu);
        } break;
        case thrd_timedout: {
            printf("Can't timedlock mutex: Timeout reach");
        } break;
        default: {
            printf("Can't timedlock mutex: Some error happened");
        } break;
    }

    if (mtx_lock(&mu) == thrd_success) {
        sensitive_variable = (sensitive_variable - 1) / 2;
        printf("Sensitive Variable: %d\n", sensitive_variable);
		
        mtx_unlock(&mu);
    }
	
    mtx_destroy(&mu);
    return 0;
}
```
> Source code available at https://github.com/Yyax13/tests/blob/1d28228d75132eca6edbc11fbde4bf9ec7d98d39/testesemc/mtx_t-usage/main.c

This example modifies the `int sensitive_variable` across three different locking methods, doing different operations and printing every step result. The mutex mode here is `mtx_plain | mtx_timed` so we can also use `mtx_timedlock`. The usage of `timespec_get` is well-documented at [[timespec - A Timestamp Nanosecond-Precise Specification for C#`timespec_get`]].

## `mtx_t` Integration with `thrd_t` Applications

Before going into mutexes and usage examples, let's first check how a program without mutexes and synchronization works and what is the errors found. I wrote this simple program in C to demonstrate this:

```c
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <threads.h>
#include <time.h>

#define TASKS_CAP (1 << 24)
#define WORKERS_CAP 24

struct task_t {
    uint64_t (*func)(void *arg);
};

uint64_t sum;

struct worker_t {
    int id;
    size_t start;
    size_t end;

    struct task_t *tasks;
};

uint64_t pseudoTask(void *arg) {
    for (int i = 0; i < 10000; i++)
        (*(uint64_t *)arg)++;

    return 0;
}

int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    for (size_t i = self->start; i < self->end; i++)
        self->tasks[i].func(&sum);

    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("Usage: %s <workers> <tasks>\n", argv[0]);
        return 1;
    }

    int workersCount = strtol(argv[1], NULL, 10);
    if (workersCount <= 0 || workersCount > (int)WORKERS_CAP) {
        printf("Invalid <workers> value: must be between 1 and %d, received "
               "\"%s\"\n",
               (int)WORKERS_CAP, argv[1]);
        return 1;
    }

    int tasksCount = strtol(argv[2], NULL, 10);
    if (tasksCount <= 0 || tasksCount > (int)TASKS_CAP) {
        printf("Invalid <tasks> value: must be between 1 and %d, received "
               "\"%s\"\n",
               (int)TASKS_CAP, argv[2]);
        return 1;
    }

    thrd_t threads[workersCount];
    struct worker_t workers[workersCount];
    struct task_t *tasks = malloc(tasksCount * sizeof(struct task_t));
    if (tasks == NULL)
        perror("Can't malloc tasks");

    printf("Expected result: %lu\n", tasksCount * 10000UL);
    for (int i = 0; i < tasksCount; i++)
        tasks[i] = (struct task_t){.func = pseudoTask};

    uint64_t sums[workersCount];
    memset(sums, 0UL, workersCount);

    for (size_t i = 0; i < (size_t)workersCount; i++) {
        size_t chunk = tasksCount / workersCount;
        size_t remainder = tasksCount % workersCount;

        size_t start = i * chunk + (i < remainder ? i : remainder);
        size_t end = start + chunk + (i < remainder ? 1 : 0);
        workers[i] = (struct worker_t){
            .id = i, .start = start, .end = end, .tasks = tasks};

        thrd_create(&threads[i], worker_f, &workers[i]);
    }

    for (int i = 0; i < workersCount; i++)
        thrd_join(threads[i], NULL);

    printf("Result: %lu\n", sum);
    printf("\nProgram ended\n");
}
```
> Source code available at  https://github.com/Yyax13/tests/blob/main/testesemc/mtx_t-with-thrd_t/without-mtx_t.c 

This snippet isn't that simple, but understandable and nothing that complex, we can follow the logic with the execution flow, instead of looking to every structure in the order they're write. 

Firstly the program checks for the arguments, the execution expects `./binary <workers> <tasks>` where each worker is a `thrd_t` parallel instance and each tasks runs one `pseudoTask`execution (that iterates 10.000 times a arithmetical operation). The code also validates the values (as each argument from `char *argv[]` is a string, the code try to convert it to integers), check it's range and conversion success.

After defining the `workersCount` and `tasksCount` we initialize `thrd_t threads[workersCount]` and `struct worker_t workers[workersCount]` in the stack. The `worker_t` structure is the one that holds the worker context:

```c
struct worker_t {
    int id;
    size_t start;
    size_t end;

    struct task_t *tasks;
};
```

The `id` is used to track each worker, the `start` and `end` fields are used by the splitting logic (as seen in [[thrd_t - A simple parallel threading API#Multiple Workers for Multiple Tasks (M N Relationship)]]) and the `struct task_t *tasks` is a direct pointer to the full task list.

You may have noticed that the `struct task_t *tasks` instance do not use the stack, I choose this approach because bigger tests became unreliable, as the ulimit defines that the process can't use more than $8192$ KiB ($8$ MiB) of stack without asking for more (we can ask for more limit to the kernel, but for simple implementations like this generally I just use the heap).

After the "expected result" printing, we start creating the tasks:

```c
for (int i = 0; i < tasksCount; i++)
    tasks[i] = (struct task_t){.func = pseudoTask};
```

This is mostly useless, we keep using the tasks structure and array because we want a portable example.

# API Lookup

## Types, Structures, Enums and Others

### `mtx_t` Modes

The unnamed enumeration constants well known for being used to setup the `mtx_t` at `mtx_init` are defined as:

```c
enum {
    mtx_plain     = 0,
    mtx_recursive = 1,
	mtx_timed     = 2
};
```

It can be used in `mtx_init` with this values:

| Combination                    | Value | Behavior            |
| ------------------------------ | ----- | ------------------- |
| Raw `mtx_plain`                | 0     | Default             |
| Raw `mtx_recursive`            | 1     | Recursive           |
| Raw `mtx_timed`                | 2     | Timed               |
| `mtx_plain` \| `mtx_timed`     | 2     | Timed               |
| `mtx_plain` \| `mtx_recursive` | 1     | Recursive           |
| `mtx_timed` \| `mtx_recursive` | 3     | Recursive and Timed |

The C11 documentation determines that we shouldn't directly use the `mtx_recursive`, by not defining it as a valid value to the `mtx_init`, as it's implementation-defined. However in the NPTL (Native POSIX Threads Library, default in Linux) we can use this way as `mtx_plain = 0` so `mtx_plain | mtx_recursive = 1` and `1 = mtx_recursive` so the direct use of it isn't really a problem. But we also needs to keep in mind that this use isn't portable, so please use it the C11 way. 

## Functions

### `mtx_destroy`


---

# Refs

> `mtx_t`
> > [IBM](https://www.ibm.com/docs/pt-br/aix/7.2.0?topic=files-threadsh-file)
> > [Sourceware](https://sourceware.org/glibc/manual/2.34/html_node/ISO-C-Mutexes.html)
> > [Open-STD](https://open-std.org/jtc1/sc22/wg14/www/docs/n2192.htm)
> > [CPP Reference](https://en.cppreference.com/c/thread/mtx_init)
