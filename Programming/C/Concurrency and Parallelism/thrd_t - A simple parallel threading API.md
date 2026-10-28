---
publish: true
---
# thrd_t - A simple parallel threading API

The `thrd_t` is a parallel threading API struct defined in `<threads.h>` _glibc_ header. It's literally a `pthread` wrapper that follows the C11 standard: just cast some types and map returning codes using `thrd_err_map` internal function.

# Introduction

The `thrd_t` type is defined as:

```c
typedef unsigned long int __thrd_t;
```

for the NPTL (Native POSIX Thread Library).

> The `thrd_t` type is aliased to this internal type, used just to track the thread ID in the real NPTL definition/implementation.

```c
#include <threads.h>

int worker(void *arg) {
    int *n = arg;
    printf("worker: %d\n", *n);

    return 42;
}

int main() {
    int value = 123;

    thrd_t thread;
    thrd_create(&thread, worker, &value);
    thrd_join(thread, NULL);

    return 0;
}
```

In this code snippet `thrd_t thread` is a handle for one thread, controlled using this steps:

1. Firstly `thrd_create(&thread, worker, &value);` create the thread, the function must follow the pthread-style function prototype, the argument (or the arguments, in plural) must be passed as `void *`, however the function returning type must be `int`. The C11 convention determines it's utility for returning codes (like 1, -1, 0, etc).

2. Then we "join" the thread. Roughly it'll wait for the worker function (like a `wg` in golang). The `thrd_join` prototype is `int thrd_join(thrd_t thr, int *res);`, this `int *res` field (filled with `NULL` in our example) is used by the join function to assign the returned value by our worker to a `int pointer` (and pass it as `&pointer`), so you can use this to follow the task execution.
   
   But we need to point a thing: the `thrd_join` function also return a `int`, that is the join operation result:
   
   
```c
enum {
    thrd_success
    thrd_nomem
    thrd_timedout
    thrd_busy
    thrd_error
};
```

# Multiple Workers for Multiple Tasks (M:N Relationship)

## Basic Example: Understanding Multiple Workers

```c
#include <stdio.h>
#include <threads.h>

#define ITERATIONS 65536  // 2^16 iterations per task
#define T 65536           // 2^16 tasks
#define W 16              // For just 16 workers

struct worker_args {
    int id;
    int begin;
    int end;
};

int worker(void *arg) {
    struct worker_args *args = arg;
    printf("worker %d: [%d, %d)\n", args->id, args->begin, args->end);

    volatile unsigned long x = 0;
    for (int i = args->begin; i < args->end; i++) {
        for (int _i = 0; _i < ITERATIONS; _i++) {
            x ^= i * _i;
        }
    }

    printf("worker %d: x -> %ld\n", args->id, x);
    return 0;
}

int main() {
    thrd_t threads[W];
    struct worker_args args[W];

    for (int i = 0; i < W; i++) {
        args[i] = (struct worker_args){
            .id = i, .begin = i * (T / W), .end = (i + 1) * (T / W)};

        thrd_create(&threads[i], worker, &args[i]);
    }

    for (int i = 0; i < W; i++)
        thrd_join(threads[i], NULL);
}
```

This is a macro-guided M:N working model, where we create two macros:

1. `#define T 65536`: This is the tasks, we want this much purely for a slower test and to compare the raw `thrd_t` between other concurrency/parallelism implementations;
2. `#define W 4`: Just 4 workers to $2^{16}$ tasks.

After that we define `worker_args` structure type, that stores:

- `id`: Worker ID;
- `beging`: Starting task;
- `end`: Final task.

In this case, the task is just a math operation and two prints, built in the worker function, so we can use a for loop that iterate over a equal division of tasks. If the task list were an array of functions (that'll be discussed later) this would be different.

Our macros are lately used to initialize stack-based `thrd_t` and `worker_args` arrays, then in two for loops:

1. The first loop iterate over `struct worker_args args[W];` array, dividing the tasks into equal parts of work.
2. The second loop just join the workers.

### Benchmark: 1 Worker vs 24 Workers

This is a benchmark using two exact copies of the demonstrated example, but one of the binaries use one thread, while the other binary uses 24. Same $2^{16}$ tasks and iterations:

![[thrd_t-worktime-bench-result.png]]

This benchmark is available under my random tests repository, on GitHub: https://github.com/Yyax13/tests/tree/main/testesemc/thrd_t-worktime (including the precompiled binaries).

## Real Functions as tasks

I just wrote this test:

```c
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <threads.h>
#include <time.h>

#define TASKS_CAP (1 << 24)
#define WORKERS_CAP 24

struct task_t {
    uint64_t (*func)(void *arg);
    void *arg;
};

struct worker_t {
    int id;
    size_t start;
    size_t end;

    uint64_t result;
    struct task_t *tasks;
};

uint64_t pseudoTask(void *arg) {
    int argument = *(int *)arg;
    uint64_t sink = 0xdeadbeef;

    for (int i = argument; i < 10000; i++) {
        argument ^= (i << 7);
        sink ^= argument;
    }

    return sink;
}

int worker_f(void *arg) {
    struct worker_t *self = (struct worker_t *)arg;
    for (size_t i = self->start; i < self->end; i++) {
        self->result ^= self->tasks[i].func(self->tasks[i].arg);
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
        printf("Invalid <workers> value: must be between 1 and 16, received "
               "\"%s\"\n",
               argv[1]);
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

    int *taskArgs = malloc(tasksCount * sizeof(int));
    if (taskArgs == NULL)
        perror("Can't malloc taskArgs");

    for (int i = 0; i < tasksCount; i++) {
        taskArgs[i] = i % 64;
        tasks[i] = (struct task_t){.func = pseudoTask, .arg = &taskArgs[i]};
    }

    for (size_t i = 0; i < (size_t)workersCount; i++) {
        size_t chunk = tasksCount / workersCount;
        size_t remainder = tasksCount % workersCount;

        size_t start = i * chunk + (i < remainder ? i : remainder);
        size_t end = start + chunk + (i < remainder ? 1 : 0);
        workers[i] = (struct worker_t){.id = i,
                                       .start = start,
                                       .end = end,
                                       .tasks = tasks,
                                       .result = 0x05390539};

        thrd_create(&threads[i], worker_f, &workers[i]);
    }

    for (int i = 0; i < workersCount; i++)
        thrd_join(threads[i], NULL);

    printf("Program ended\n");
}
```

> Available at https://github.com/Yyax13/tests/tree/main/testesemc/thrd_t-work-chunks

In that we use workers to run a real function, so we have a wrapper called `worker_f` that follows the `thrd_create` prototype standard. This runs like a "benchmark", as the `pseudoTask` is a heavy CPU function.

There isn't much technical differences between this version and the simple math version, both use the worker function (in this case `worker_f`) to manage workers. The main difference is that the functional version (not like the other don't work, functional because it's actually using real function calling) uses the `tasks` array with function pointer AND argument (`void *`) pointer in the structure.

I highly recommend reading this code and the other one before trying to write your own task benchmark, without AI, so you can train your knowledge ;)

The expected result for this example with $24$ workers when compared with $1$ worker, both with $5.000.000$ tasks is:

```
[12ms][main][~/Projects/Tests/testesemc/thrd_t-work-chunks] :) ./main 24 5000000
Program ended
[6,689s][main][~/Projects/Tests/testesemc/thrd_t-work-chunks] :) ./main 1 5000000 
Program ended
[26,564s][main][~/Projects/Tests/testesemc/thrd_t-work-chunks] :) 
```

# API Lookup

## Types, Structures, Enums and Others

### `thrd_t`

This is the base type of the api, used to manage every created task/worker. It's typedef definition is:

```c
typedef __thrd_t thrd_t;

// Which is
typedef unsigned long int __thrd_t;
```

It just stores a identification flag to a NPTL implementation, used by the glibc internal code as `__thrd_t` and provided to the user as `thrd_t`.

### `thrd_start_t`

This is the type used by `threads.h` as the function that the threads actually run. It's typedef definition is:

```c
typedef int (*thrd_start_t) (void*);
```

>Source code at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l42

The returning integer can be used as return status code (like the POSIX standard for program returning), i.e.: `0` for a clean run or `1` if there is any error. It also can be expanded to support `errno` (because it's type is `int` too, by default) or even pointers to structures (probably a hack, as we normally store pointers in unsigned integers or longs, and you'll need to do some weird casts to really use this) if you want to.

### `thrd_t` Success Enumeration Constant

```c
enum {
    thrd_success  = 0,
    thrd_busy     = 1,
    thrd_error    = 2,
    thrd_nomem    = 3,
    thrd_timedout = 4
};
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/threads.h;h=44468e72f3298cd844639510697679b8335b3f06;hb=HEAD#l45

## Functions
### `thrd_create`

The `thrd_create` function is defined by the prototype:

```c
int thrd_create(thrd_t *thr, thrd_start_t func, void *arg);
```

It's used to assign a task (the [[#`thrd_start_t`]] type) to a [[#`thrd_t`]] instance. The argument is passed to the function as `void *`.

The thread starts at the call moment, if you want to wait for it, you may use [[#`thrd_join`]]

### `thrd_join`

The `thrd_join` function is defined by the prototype:

```c
int thrd_join(thrd_t thr, int *res);
```

It's used to wait for a running thread (passed to function through `thrd_t thr`) exit. The `int *res` argument is used to store the returned value by the thread function, it's normal to use a null pointer here if the returning value isn't relevant.

The returning `int` is mapped over the [[#`thrd_t` Success Enumeration Constant]].

### `thrd_exit`

The `thrd_exit` function is defined by the prototype:

```c
_Noreturn void thrd_exit(int res);
```

The `int res` argument is used to set the return value of the thread.

The use of this is when you need to return but can't just use the `return` statement, i.e.:

```c
// Never ends
int foo(void *bar) {
    while (1)
	    sleep(10);
}

int main() {
   thrd_t worker;
   thrd_create(&worker, foo, NULL);
   thrd_detach(worker);
   
   // If I just return 0; here, the thread would be killed mid-flight.
   // In this example this isn't a problem but for real-world systems, it is.
   // A simple way to solve this is by calling the thrd_exit() function.
   
   thrd_exit(0);
   
   // Now I can follow doing another things without the need of the return statement
}
```

You can also use it if you is deeply inside the callstack:

```c
void parseHTTP(conn_t *c) {
	if (badheaders(c))
		thrd_exit(EPROTO); // Unwind the whole thread now
		
	// Something else
}

int worker(void *arg) {
	parseHTTP(arg);
	return 0;
}
```

### `thrd_detach`

The `thrd_detach` function is defined by the prototype:

```c
int thrd_detach(thrd_t thr);
```

It's a literal wrapper for the `pthread_detach` that, as the original, detaches the thread from the main program and freely run.

```c
int
__thrd_detach (thrd_t thr)
{
  int err_code;
 
  err_code = __pthread_detach (thr);
  return thrd_err_map (err_code);
}
```
> Code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/thrd_detach.c;h=953f3ad71ffa315535dace6d2f03096d8d7bf54a;hb=HEAD#l23

### `thrd_equal`

The `thrd_equal` function is defined by the prototype:

```c
int thrd_equal(thrd_t thr0, thrd_t thr1);
```

This just compare `thr0 == thr1` and if the result isn't 0, different threads, if 0, `thr0` and `thr1` refers to the same thread:

```c
int
thrd_equal (thrd_t lhs, thrd_t rhs)
{
  return lhs == rhs;
}
```
> Source code available at https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/pthread/thrd_equal.c;h=c90c9d516c879de649c5aed38be2b5448d29d027;hb=HEAD#l21

### `thrd_sleep`

The `thrd_sleep` function is defined by the prototype:

```c
int thrd_sleep(const struct timespec *duration, struct timespec *remaining);
```

You can use it like:

```c
int worker(void *arg) {
	struct timespec wait = {
		.tv_sec = 61, 
		.tv_nsec = 6767676767
	};
	
	thrd_sleep(&wait, &wait);
}
```

---

# Refs

> `thrd_t`
> > [IBM](https://www.ibm.com/docs/pt-br/aix/7.2.0?topic=files-threadsh-file)
> > [My ChatGPT chat :)](https://chatgpt.com/share/6ac3f604-fedc-83e9-b521-0266d108e379)
> > [`thrd_success`, `thrd_error` and others](https://en.cppreference.com/c/thread/thrd_errors)
> > [`__thrd_t` Definition in the original repository](https://sourceware.org/git/?p=glibc.git;a=blob;f=sysdeps/nptl/bits/thread-shared-types.h;h=624d616fdc6bc2fc43b1559ec269a70e5c5b46b6;hb=HEAD#l107)
> > [GLIBC Source Code](https://sourceware.org/git/?p=glibc.git;a=summary)