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
> The `TIME_MONOTONIC` isn't C11 portable and must be used ONLY in glibc (GNU C).

### TIME_ACTIVE

### TIME_THREAD_ACTIVE

### CLOCK_REALTIME

### CLOCK_MONOTONIC

### CLOCK_THREAD_CPUTIME_ID

### CLOCK_PROCESS_CPUTIME_ID

## Functions
### `timespec_get`

The `timespec_get` function is used to fill the `struct timespec` structure with data, commonly used with the macro

### `timespec_getres`

### `clock_gettime`

### `clock_getres`

### `nanosleep`

### `clock_nanosleep`

---

# Refs

> Topic
> > Ref