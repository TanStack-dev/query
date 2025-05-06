---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-06T03:50:31.682Z'
id: NotifyManager
title: notifyManager
---

`notifyManager` 负责在 Tanstack Query 中调度和批量处理回调。

它提供以下方法：

- [batch](#notifymanagerbatch)
- [batchCalls](#notifymanagerbatchcalls)
- [schedule](#notifymanagerschedule)
- [setNotifyFunction](#notifymanagersetnotifyfunction)
- [setBatchNotifyFunction](#notifymanagersetbatchnotifyfunction)
- [setScheduler](#notifymanagersetscheduler)

## `notifyManager.batch`

`batch` 可用于批量处理传入回调内所有已调度的更新。该方法主要用于内部优化 queryClient 的更新。

```ts
function batch<T>(callback: () => T): T
```

## `notifyManager.batchCalls`

`batchCalls` 是一个高阶函数，接收回调函数并对其进行包装。所有对包装函数的调用都会将该回调调度到下一批次执行。

```ts
type BatchCallsCallback<T extends Array<unknown>> = (...args: T) => void

function batchCalls<T extends Array<unknown>>(
  callback: BatchCallsCallback<T>,
): BatchCallsCallback<T>
```

## `notifyManager.schedule`

`schedule` 将函数调度到下一批次执行。默认情况下使用 setTimeout 运行批次，但该行为可配置。

```ts
function schedule(callback: () => void): void
```

## `notifyManager.setNotifyFunction`

`setNotifyFunction` 用于覆盖通知函数。该函数会在回调应执行时被调用。默认的 notifyFunction 会直接执行回调。

例如，可在运行测试时用 `React.act` 包装通知：

```ts
import { notifyManager } from '@tanstack/react-query'
import { act } from 'react-dom/test-utils'

notifyManager.setNotifyFunction(act)
```

## `notifyManager.setBatchNotifyFunction`

`setBatchNotifyFunction` 设置用于批量更新的函数

如果您的框架支持自定义批量处理函数，可通过调用 notifyManager.setBatchNotifyFunction 告知 TanStack Query。

例如，以下是 solid-query 中设置批量函数的方式：

```ts
import { notifyManager } from '@tanstack/query-core'
import { batch } from 'solid-js'

notifyManager.setBatchNotifyFunction(batch)
```

## `notifyManager.setScheduler`

`setScheduler` 配置一个自定义回调，用于调度下一批次的运行时机。默认行为是 `setTimeout(callback, 0)`。

```ts
import { notifyManager } from '@tanstack/react-query'

// 在下一个微任务中调度批次
notifyManager.setScheduler(queueMicrotask)

// 在下一帧渲染前调度批次
notifyManager.setScheduler(requestAnimationFrame)

// 在未来某个时间调度批次
notifyManager.setScheduler((cb) => setTimeout(cb, 10))
```
