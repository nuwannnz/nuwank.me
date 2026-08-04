---
pubDatetime: 2020-01-04T00:00:00.000Z
title: grep command [ Linux tips ]
description: How to use the grep command to filter or search text from files or input streams.
tags:
  - Programming
  - Linux
  - Bash
  - Beginner
canonicalURL: https://medium.com/@nuwan407/grep-command-linux-tips-f6233a67adcb
---

Grep command can be used to filter or search text from files or input streams.

Basic usage,

```bash
grep "text_to_search" fileToSearch
```

In here the "text_to_search" can be a plain string or a regular expression.

## Example 1

Assume that we need to find whether the text "user login failed" has appeared in a log file. Then we can use the grep command like below.

```bash
grep "user login failed" logFile.txt
```

After running the above line grep will print the lines of text which includes the text "user login failed".

Another very useful way we can use grep command is to filter out input streams like the output of another command (or another grep command).

## Example 2

Let's say you want to find out whether a file is there in a folder which contains like 1000 other files. We can simply use the grep command to find out that like below.

```bash
ls | grep "file_name_to_find"
```

In here the '|' (pipe) will send the output of the `ls` command as an input to the `grep` command (but it's not a `grep` specific operator).

So these are the most common ways we can use grep to make our lives easier and it has limitless usages but grep has many more options too. Below are some of the options we can use.

- `-n` : prints the line number
- `-o` : prints only the matching part of the text
- `-c` : prints the number of matches

## Example 3

If we want to know how many files have the name as the file name in the above example we can simply use the `-c` option.

```bash
ls | grep -c "file_name_to_find"
```
