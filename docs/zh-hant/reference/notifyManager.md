---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-08T20:14:59.347Z'
id: NotifyManager
title: notifyManager
---

`notifyManager` 負責在 Tanstack Query 中處理回調的排程與批次處理。

它提供了以下方法：

- [batch](#notifymanagerbatch)
- [batchCalls](#notifymanagerbatchcalls)
- [schedule](#notifymanagerschedule)
- [setNotifyFunction](#notifymanagersetnotifyfunction)
- [setBatchNotifyFunction](#notifymanagersetbatchnotifyfunction)
- [setScheduler](#notifymanagersetscheduler)

## `notifyManager.batch`

`batch` 可用於批次處理傳入回調內所有排定的更新。這主要用於內部優化 queryClient 的更新。

```ts
function batch<T>(callback: () => T): T
```

## `notifyManager.batchCalls`

`batchCalls` 是一個高階函式，它接收一個回調並將其包裹起來。所有對包裹後函式的呼叫都會將回調排定在下一個批次中執行。

```ts
type BatchCallsCallback<T extends Array<unknown>> = (...args: T) => void

function batchCalls<T extends Array<unknown>>(
  callback: BatchCallsCallback<T>,
): BatchCallsCallback<T>
```

## `notifyManager.schedule`

`schedule` 將一個函式排定在下一個批次中執行。預設情況下，批次會透過 setTimeout 執行，但這可以進行配置。

```ts
function schedule(callback: () => void): void
```

## `notifyManager.setNotifyFunction`

`setNotifyFunction` 會覆蓋通知函式。此函式會在回調應執行時接收它。預設的 notifyFunction 僅會直接呼叫回調。

這可用於例如在執行測試時用 `React.act` 包裹通知：

```ts
import { notifyManager } from '@tanstack/react-query'
import { act } from 'react-dom/test-utils'

notifyManager.setNotifyFunction(act)
```

## `notifyManager.setBatchNotifyFunction`

`setBatchNotifyFunction` 設定用於批次更新的函式

如果你的框架支援自訂的批次處理函式，可以透過呼叫 notifyManager.setBatchNotifyFunction 讓 TanStack Query 知道。

例如，以下是在 solid-query 中設定批次函式的方式：

```ts
import { notifyManager } from '@tanstack/query-core'
import { batch } from 'solid-js'

notifyManager.setBatchNotifyFunction(batch)
```

## `notifyManager.setScheduler`

`setScheduler` 配置一個自訂的回調，用於排定下一個批次的執行時機。預設行為是 `setTimeout(callback, 0)`。

```ts
import { notifyManager } from '@tanstack/react-query'

// 在下一個微任務中排定批次
notifyManager.setScheduler(queueMicrotask)

// 在下一個畫面渲染前排定批次
notifyManager.setScheduler(requestAnimationFrame)

// 在未來的某個時間排定批次
notifyManager.setScheduler((cb) => setTimeout(cb, 10))
```
