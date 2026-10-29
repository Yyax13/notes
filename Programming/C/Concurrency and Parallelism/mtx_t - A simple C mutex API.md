---
tags:
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

    free(tasks);
    return 0;
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

You may have noticed that the `struct task_t *tasks` instance do not use the stack, I chose this approach because bigger tests became unreliable, as the ulimit defines that the process can't use more than $8192$ KiB ($8$ MiB) of stack without asking for more (we can ask for more limit to the kernel, but for simple implementations like this generally I just use the heap).

After the "expected result" printing, we start creating the tasks:

```c
for (int i = 0; i < tasksCount; i++)
    tasks[i] = (struct task_t){.func = pseudoTask};
```

This is mostly useless, we keep using the tasks structure and array because we want a portable example, so if the function sometime need a argument we can just add it to the structure.

Then, we start iterating this loop:

```c
for (size_t i = 0; i < (size_t)workersCount; i++) {
    size_t chunk = tasksCount / workersCount;
    size_t remainder = tasksCount % workersCount;
	
    size_t start = i * chunk + (i < remainder ? i : remainder);
    size_t end = start + chunk + (i < remainder ? 1 : 0);
    workers[i] = (struct worker_t){
        .id = i, .start = start, .end = end, .tasks = tasks};
	
    thrd_create(&threads[i], worker_f, &workers[i]);
}
```

Here we're splitting the tasks into multiple workers, there is many ways of doing this, but I chose the easier unportable way: literally split the tasks between multiple workers. Yeah, I know a tasks queue is much more cleaner and portable for every kind of task, however this is just a demonstration and not a _"omaga mutexes and threads universal boilerplate"_.

The loop works by creating a chunk every iteration, the formula is $C = \frac{t}{w}$ where $C$ is the chunk, $t$ is the `tasksCount` and $w$ the `workersCount`.  The remainder is calculated using the modulo operation (as the `size_t chunk` can't be a floating point number) and used when assigning values to the `start` and `end` fields. 

The assignment of `start` and `end` is made by:

- `start`: The loop index, `i`, times chunk plus $x$ ($x$ being `i` if $i < \text{remainder}$, `remainder` else);
- `end`: `start` plus `chunk` plus $x$ ($x$ being $1$ if $i < remainder$, $0$ else).

Then the values is assigned to the `workers[i]` instance (current worker by loop index) using the same index as the `worker.id`. After this the `thrd_create` function is called (definition and documentation available in [[thrd_t - A simple parallel threading API#`thrd_create`]]) passing a pointer the `workers[i]` as the `void *arg` and using the `worker_f` function as the `int (*func)(void *arg)`.

The `worker_f` function is implemented as:

```c
int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    for (size_t i = self->start; i < self->end; i++)
        self->tasks[i].func(&sum);
	
    return 0;
}
```

The function is simple, firstly the function cast the `void *arg` to a `struct worker_t *`, and then iterates over a loop where the index starts as `self->start` (start of current worker chunk) and compares it per-iteration with `self->end`. Inside the loop a simple statement is iterated: `self->tasks[i].func(&sum)`. The `self->tasks[x]` is a `task_t` instance:

```c
struct task_t {
    uint64_t (*func)(void *arg);
};
```

The `sum` variable used as the `pseudoTask` `void *arg` argument is defined as:

```c
uint64_t sum;
```

This variable is used to assign the count (later it'll be compared, to the _expected value_, by the user). The called `pseudoTask` code just iterates $10.000$ the post-increment operator against a cast of `void *arg` to `uint64_t`:

```c
uint64_t pseudoTask(void *arg) {
    for (int i = 0; i < 10000; i++)
        (*(uint64_t *)arg)++;
	
    return 0;
}
```

Back to the main function, there is another for loop:

```c
for (int i = 0; i < workersCount; i++)
    thrd_join(threads[i], NULL);
```

As documented in [[thrd_t - A simple parallel threading API#`thrd_join`|this note section]], the `thrd_join` function is used to wait for the running thread. The loop iterates over `thrd_t threads[]` array to wait for each thread sequentially, however this implementation do not run every thread sequentially, because we created (using `thrd_select`)  all the threads one loop back.

After all that logic, the main function prints the output, free the `tasks` allocated heap and return. The expected result for a normal execution is:

```
[8ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) ./without-mtx_t 24 2500000
Expected result: 25000000000
Result: 8193200000

Program ended
[25ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) 
```

And this is a race condition example.

### So, Let's use Mutexes to Fix the Race Condition

Yeah, I just modified the source (chill, I won't spend much more time explaining again, just the modified snippets), here it's:

```c
/**
 * I can handle this two ways:
 *      I could use the mutex directly in pseudoTask(), breaking the decoupling architecture
 *      OR
 *      I can use the mutex in the worker_f()
 *
 * I chose to use the 2nd option.
 * I also decided to set the mutex as a global variable, to follow the sum standard.
 */

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
mtx_t mu;

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
    for (size_t i = self->start; i < self->end; i++) {
        mtx_lock(&mu);
        self->tasks[i].func(&sum);
        mtx_unlock(&mu);
    }

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

    if (mtx_init(&mu, mtx_plain) != thrd_success) {
        printf("Can't init mtx_t mu\n");
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

    mtx_destroy(&mu);
    free(tasks);
    return 0;
}
```
> Source code available in https://github.com/Yyax13/tests/blob/main/testesemc/mtx_t-with-thrd_t/with-mtx_t.c

The first change is creating a global mutex instance (as this is just an example):

```c
mtx_t mu;
```

The `mtx_t` C11 API haven't a pthread-mutex-like static initialization macro/constant, so we need to initialize it, and this is the seconds change in the code:

```c
if (mtx_init(&mu, mtx_plain) != thrd_success) {
    printf("Can't init mtx_t mu\n");
    return 1;
}
```

Here we used the `mtx_plain` mode, as we do not need `mtx_timedlock` or recursive locking. The checking for initialization errors is also here, just to demonstrate the correct practice.

Then the `worker_f` function implement the mutex:

```c
int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    for (size_t i = self->start; i < self->end; i++) {
        mtx_lock(&mu);
        self->tasks[i].func(&sum);
        mtx_unlock(&mu);
    }
	
    return 0;
}
```

It locks the mutex before calling the `pseduoTask` function, and unlock it after the function execution (which is pretty slow btw, we'll benchmark this later and you'll see the speed difference).

The rest of code was kept same, I just added the `mtx_destroy` function call before freeing the `tasks` array to ensure it's destroying. The expected result/output of this synchronized code is:

```
[11ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) ./with-mtx_t 24 2500000 
Expected result: 25000000000
Result: 25000000000

Program ended
[339ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :)
```

###  Damn Slow Execution

After we added this mutex technique, were we containerized the `pseudoTask` inside a blocking execution using the `mtx_t` interface, we faced a huge performance drop. For the demonstration I'll use the maximum tasks amount, $16777216$:

```
[10ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) time ./with-mtx_t 24 16777216
Expected result: 167772160000
Result: 167772160000

Program ended
./with-mtx_t 24 16777216  2,81s user 13,41s system 744% cpu 2,177 total
[2,182s][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) 
```

Now without mutexes:

```
[7ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] ᛋᛋ time ./without-mtx_t 24 16777216
Expected result: 167772160000
Result: 47707920000

Program ended
./without-mtx_t 24 16777216  0,09s user 0,06s system 196% cpu 0,075 total
[79ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] ᛋᛋ 
```

Yes, the race condition is $3022.22\%$ faster :0

### Fixing this Trash Speed

I wrote another version, the code still the same so because I made just one small change I'll note paste the full code here. That is it:

```c
// from
int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    for (size_t i = self->start; i < self->end; i++) {
        mtx_lock(&mu);
        self->tasks[i].func(&sum);
        mtx_unlock(&mu);
    }
	
    return 0;
}

// to 
int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    uint64_t accumulator = 0;
    for (size_t i = self->start; i < self->end; i++)
        self->tasks[i].func(&accumulator);
	
    mtx_lock(&mu);
    sum += accumulator;
    mtx_unlock(&mu);
	
    return 0;
}
```
> Full source code available in https://github.com/Yyax13/tests/blob/main/testesemc/mtx_t-with-thrd_t/fast-mtx_t.c

The main change is that in the optimized version we update an accumulator, and incrementing the accumulator in the global `sum` is basically cost-less as we lock the mutex one time per thread. Here is a comparison:

```
[7ms][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) time ./with-mtx_t 24 16777216 
Expected result: 167772160000
Result: 167772160000

Program ended
./with-mtx_t 24 16777216  2,71s user 13,71s system 756% cpu 2,171 total
[2,176s][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) time ./fast-mtx_t 24 16777216
Expected result: 167772160000
Result: 167772160000

Program ended
./fast-mtx_t 24 16777216  0,06s user 0,06s system 168% cpu 0,070 total
[0,075s][main][~/Projects/Tests/testesemc/mtx_t-with-thrd_t] :) 
```

$97\%$ Less runtime.

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
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l55

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

### `mtx_init`

The `mtx_init` function is used to initialize the `mtx_t` instance. It's prototype is:

```c
extern int mtx_init (mtx_t *__mutex, int __type);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l135

The returning value must be compared with one of the [[thrd_t - A simple parallel threading API#`thrd_t` Success Enumeration Constant]] for any errors (must be `thrd_success`).

The `int __type`  must be one of the [[#`mtx_t` Modes]] combinations.

### `mtx_lock`

The `mtx_lock` function is used to lock a `mtx_t` instance. It's prototype is:

```c
extern int mtx_lock (mtx_t *__mutex);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l139

The returning value must be `thrd_success`, but you can also compare against `thrd_error` as this function do not return any other error types (by default).

There is a catch by using this function with a `mtx_plain` mutex, if you lock twice the same mutex instance, the thread deadlocks (still locked waiting for an unlock that'll never happen). So if you need to lock recursively, use the `mtx_recursive` mode as a modifier to your mode (there is a better description at [[#`mtx_t` Modes]]). 

### `mtx_trylock`

The `mtx_trylock` works like the `mtx_lock` function, the main difference is the `mtx_trylock` return an error if the mutex is locked, instead of blocking the thread and waiting. It's prototype is:

```c
extern int mtx_trylock (mtx_t *__mutex);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l161

The returning value also must be `thrd_success`, however (unlikely `mtx_lock`) this function can also return `thrd_busy`, representing a locked mutex, `thrd_error` also is returned if any other error occurs.

### `mtx_timedlock`

The `mtx_timedlock` works like the `mtx_trylock` but it wait for a timeout instead of instantly returning an error. It's prototype is:

```c
extern int mtx_timedlock (mtx_t *__restrict __mutex,
	                      const struct timespec *__restrict __time_point);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l145

It also returns `thrd_success` as it's success value, but the error that you might check is `thrd_timedout` for time deadline reaching. The `thrd_error` is the default return value for any other error.

An implementation example is available at [[#Mutexes Usage]] and the `struct timespec` documentation is also available at [[timespec - A Timestamp Nanosecond-Precise Specification for C]].

### `mtx_unlock`

The `mtx_unlock` function is used to unlock a locked mutex instance, it's prototype is:

```c
extern int mtx_unlock (mtx_t *__mutex);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l165

The return value is `thrd_success` on a successfully clean run, `thrd_error` otherwise.

### `mtx_destroy`

The `mtx_destroy` function is responsible for correctly destroying the mutex by releasing correctly it's resources and mapping any possible errors. It's prototype is:

```c
extern void mtx_destroy (mtx_t *__mutex);
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l168

---
# Related

- [[timespec - A Timestamp Nanosecond-Precise Specification for C]]
- [[thrd_t - A simple parallel threading API]]

# Refs

> `mtx_t`
> > [IBM](https://www.ibm.com/docs/pt-br/aix/7.2.0?topic=files-threadsh-file)
> > [Sourceware](https://sourceware.org/glibc/manual/2.34/html_node/ISO-C-Mutexes.html)
> > [Open-STD](https://open-std.org/jtc1/sc22/wg14/www/docs/n2192.htm)
> > [CPP Reference](https://en.cppreference.com/c/thread/mtx_init)
