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

After calling the `mtx_init` 

## 2nd Step: Lock it

There is 

# API Lookup

## Types, Structures, Enums and Others

### `mtx_t` Modes

The unnamed enumeration constants well known for being used to setup the `mtx_t` at `mtx_init`. It's definition is:

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


---

# Refs

> `mtx_t`
> > [IBM](https://www.ibm.com/docs/pt-br/aix/7.2.0?topic=files-threadsh-file)
> > [Sourceware](https://sourceware.org/glibc/manual/2.34/html_node/ISO-C-Mutexes.html)
> > [Open-STD](https://open-std.org/jtc1/sc22/wg14/www/docs/n2192.htm)
> > [CPP Reference](https://en.cppreference.com/c/thread/mtx_init)
