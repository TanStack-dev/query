---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-08T20:15:07.964Z'
id: MutationCache
title: MutationCache
---

`MutationCache` 是用於儲存 mutations 的儲存空間。

**通常情況下，您不會直接與 MutationCache 互動，而是使用 `QueryClient`。**

```tsx
import { MutationCache } from '@tanstack/react-query'

const mutationCache = new MutationCache({
  onError: (error) => {
    console.log(error)
  },
  onSuccess: (data) => {
    console.log(data)
  },
})
```

它提供的方法有：

- [`getAll`](#mutationcachegetall)
- [`subscribe`](#mutationcachesubscribe)
- [`clear`](#mutationcacheclear)

**選項**

- `onError?: (error: unknown, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 選填
  - 當某個 mutation 遇到錯誤時，此函式將被呼叫。
  - 若您回傳一個 Promise，它將被等待
- `onSuccess?: (data: unknown, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 選填
  - 當某個 mutation 成功時，此函式將被呼叫。
  - 若您回傳一個 Promise，它將被等待
- `onSettled?: (data: unknown | undefined, error: unknown | null, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 選填
  - 當某個 mutation 完成（無論成功或失敗）時，此函式將被呼叫。
  - 若您回傳一個 Promise，它將被等待
- `onMutate?: (variables: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 選填
  - 在某個 mutation 執行前，此函式將被呼叫。
  - 若您回傳一個 Promise，它將被等待

## 全域回呼函式

`MutationCache` 上的 `onError`、`onSuccess`、`onSettled` 和 `onMutate` 回呼函式可用於在全域層級處理這些事件。它們與提供給 `QueryClient` 的 `defaultOptions` 不同，原因如下：

- `defaultOptions` 可以被每個 Mutation 覆寫 — 而全域回呼函式 **總是** 會被呼叫。
- `onMutate` 不允許回傳 context 值。

## `mutationCache.getAll`

`getAll` 會回傳快取中的所有 mutations。

> 注意：大多數應用程式通常不需要使用此方法，但在罕見情況下需要獲取有關 mutation 的更多資訊時，它會派上用場。

```tsx
const mutations = mutationCache.getAll()
```

**回傳值**

- `Mutation[]`
  - 快取中的 Mutation 實例

## `mutationCache.subscribe`

`subscribe` 方法可用於訂閱整個 mutation 快取，並在快取發生安全/已知的更新時（如 mutation 狀態變更或 mutations 被更新、新增或移除）收到通知。

```tsx
const callback = (event) => {
  console.log(event.type, event.mutation)
}

const unsubscribe = mutationCache.subscribe(callback)
```

**選項**

- `callback: (mutation?: MutationCacheNotifyEvent) => void`
  - 每當 mutation 快取更新時，此函式將被呼叫並傳入相關事件。

**回傳值**

- `unsubscribe: Function => void`
  - 此函式將取消訂閱 mutation 快取的回呼函式。

## `mutationCache.clear`

`clear` 方法可用於完全清除快取並重新開始。

```tsx
mutationCache.clear()
```
