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

![[The Linux Components.png]]

## The Kernel

The Kernel is the core of the Linux Operating System, it's the software between the hardware and the user-land, managing system resources. It controls everything: 

- ***The memory*** - Allocates and manages system memory and virtual memory;
- ***Processes*** - Schedules, yields, stop, kill and control the execution using queues. Processes are isolated from one another and from the Kernel, so that one process can't read or modify the memory of another process or the Kernel;
- ***Resources Allocation*** - Distributes CPU, memory, virtual memory and I/O resources among processes and networks;
- ***Device Management*** - Controls hardware device through device drivers;
- ***Application Interaction*** - Acts as a bridge between the user-land and the hardware/resources, providing a clean syscalls interface.
- ***File System***  - The kernel provides the file system and abstraction over they all, so the applications can easily creates, 

## The Shell

A shell is a special-purpose program designed to read command typed by a user (usually in a terminal) and executed appropriate programs (or built-in functions).

---

# Refs

> The Linux Architecture
> > [Wikipedia - Linux](https://en.wikipedia.org/wiki/Linux)
> > [Wikipedia - Everything is a File](https://en.wikipedia.org/wiki/Everything_is_a_file)
> > [Geeks for Geeks - Architecture of Linux Operating System](https://www.geeksforgeeks.org/linux-unix/architecture-of-linux-operating-system/)
> > [[The Linux Programming Interface.pdf|The Linux Programming Interface]]
