---
publish: true
tags:
  - unfinished
---
The Linux is a [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) operating system, which is designed to be fast, following the [everything is a file](https://en.wikipedia.org/wiki/Everything_is_a_file) approach, of the Unix family. The main components of the Linux operating system are:

- Application
- Shell
- Kernel
- Hardware
- Utilities

Each layer communicates with the one below it, creating a structured and efficient OS design.

![[The Linux Components with Examples.png]]

## The Kernel

The Kernel is the core of the Linux Operating System, it's the software between the hardware and the user-land, managing system resources. It controls everything: 

- ***The memory*** - Allocates and manages system memory and virtual memory;
- ***Processes*** - Schedules, yields, stop, kill and control the execution using queues. Processes are isolated from one another and from the Kernel, so that one process can't read or modify the memory of another process or the Kernel;
- ***Resources Allocation*** - Distributes CPU, memory, virtual memory and I/O resources among processes and networks;
- ***Device Management*** - Controls hardware device through device drivers;
- ***Application Interaction*** - Acts as a bridge between the user-land and the hardware/resources, providing a clean syscalls interface.
- ***File System***  - The kernel provides the file system and abstraction over they all, so the applications can easily create, read and delete files.

## The Shell

A shell is a special-purpose program designed to read command typed by a user (usually in a terminal) and executed appropriate programs (or built-in functions).

The shell isn't part of the kernel. It's an application that runs in the user space (userland) that uses system calls (syscalls) to interact with the kernel.

The main function of a shell is to provide a clean interface for controlling and monitoring the Operating System.

### How The Shell Works

When the user writes a command in [[The Terminal]], e.g.:

```sh
ls -lAh
```

the shell runs various tasks:

1. Read the written line;
2. Analyze the command syntax;
3. Expands variables (like `$HOME`, `$PWD`, etc), wildcard patterns (like `*`, `?` and others) and command replacement (if I use `ls -lAh $(readlink file1)`, the shell firstly runs the `readlink` command and then replaces the `$()` with the output to be used in `ls -lAh`);
4. Find the binary executable (like `/usr/bin/ls`), commonly in the `$PATH` variable;
5. Creates a new process (mainly using the `fork()` syscall/_libc_ function);
6. Replaces the new process by the program (found at the 4th step);
7. Await it's conclusion (or continue, if the process is running in background);
8. Show the output to the user (mainly redirecting the `stdout` of the new process to the shell `stdout` file descriptor).

The shell acts as a command interpreter, while the kernel is responsible for the effective execution of interpreted operations.

### Other Responsibilities

- Maintain a history of recent commands executed
- Executing scripts
- Environment Variables Management
- Redirecting I/O (with `>`, `<<`, etc)
- _pipes_ (`|`)
- Job Control
- Globbing (expanding wildcards and others)
- Autocomplete

---

# Refs

> The Linux Architecture
> > [Wikipedia - Linux](https://en.wikipedia.org/wiki/Linux)
> > [Wikipedia - Everything is a File](https://en.wikipedia.org/wiki/Everything_is_a_file)
> > [Geeks for Geeks - Architecture of Linux Operating System](https://www.geeksforgeeks.org/linux-unix/architecture-of-linux-operating-system/)
> > [[The Linux Programming Interface.pdf|The Linux Programming Interface]]
