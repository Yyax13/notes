---
publish: true
---
# Introduction

The Operating System (OS) is the manager of hardware resources, providing system calls (syscalls) and a function calling pattern (the ABI) for the low-level assembly. The OS provides a clear interface to other software directly access your CPU/GPU, memory, file system, I/O devices and others.

# Popular Operating Systems

## Microsoft Windows

Windows is a proprietary operating system that is widely used on desktop computers, laptops, workstations, enterprise servers and XBOX Consoles. 

The Windows Kernel is built as a Hybrid Kernel, mixing both *microkernel* architecture and monolithic architecture. The monolithic part manages drivers, scheduling, memory, file system, etc. It runs in the kernel space for performance.

Some subsystems of Windows runs as modular components, as the HAL (Hardware Abstraction Layer) and some critical userland services.

## MacOS

MacOS is trash.

## Linux

The Linux is a FOSS (Fully Open Source Software) developed by Linus Torvalds in 1991 as a free implementation of UNIX Operating System.

The Linux follows a monolithic kernel architecture, expandable with modules (Loadable Kernel Modules, a.k.a. LKMs).

## Android

Android is a linux-based Operating System developed for mobile. It runs under the `ARM` CPU Architecture.

## iOS

Trash too.

---

# Refs

> Introduction
> > [Reddit](https://www.reddit.com/r/explainlikeimfive/comments/19ey0ix/eli5_what_is_actually_an_operating_system_os/)
> > [IBM](https://www.ibm.com/think/topics/operating-systems)

> Popular Operating Systems
> > Windows
> > > [Wikipedia](https://en.wikipedia.org/wiki/Architecture_of_Windows_NT)
> > Linux
> > > [Wikipedia](https://en.wikipedia.org/wiki/History_of_Linux)
> > > [Wikipedia](https://en.wikipedia.org/wiki/Linux_kernel)
> > > [Reddit](https://www.reddit.com/r/linux/comments/pcv6am/has_linux_evolved_to_a_micro_kernel_or_is_it/)
> > > [Wikipedia](https://en.wikipedia.org/wiki/Loadable_kernel_module)