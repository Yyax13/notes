# Definition

The timestamp resolution determines the granularity used to measure time intervals in computing systems. It's commonly defined in nanoseconds or milliseconds (in older machines/Operating Systems).

# Examples

## POSIX Example with `timespec_getres`

I prepared this simple example:

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

The `timespec_getres` API is documented [[timespec - A Timestamp Nanosecond-Precise Specification for C#`timespec_getres`|here]], so you should take a look. The output of this program is:

```
== Timer resolution test

== Timer resolution (s): 0.000000001
== Timer resolution (ns): 1
```

---
# Related

- [[timespec - A Timestamp Nanosecond-Precise Specification for C]];
- [[POSIX Clocks - A Clock and Timing API]]
