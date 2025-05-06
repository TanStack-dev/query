---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-06T03:51:33.721Z'
id: MutationCache
title: MutationCache
---
`MutationCache` 是用于存储变更 (mutations) 的容器。

**通常情况下，您不会直接与 MutationCache 交互，而是通过 `QueryClient` 进行操作。**

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

其提供的方法包括：

- [`getAll`](#mutationcachegetall)
- [`subscribe`](#mutationcachesubscribe)
- [`clear`](#mutationcacheclear)

**配置项**

- `onError?: (error: unknown, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 可选
  - 当某个变更操作发生错误时，此函数将被调用。
  - 如果返回 Promise，则会等待其执行完成
- `onSuccess?: (data: unknown, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 可选
  - 当某个变更操作成功时，此函数将被调用。
  - 如果返回 Promise，则会等待其执行完成
- `onSettled?: (data: unknown | undefined, error: unknown | null, variables: unknown, context: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 可选
  - 当某个变更操作完成（无论成功或失败）时，此函数将被调用。
  - 如果返回 Promise，则会等待其执行完成
- `onMutate?: (variables: unknown, mutation: Mutation) => Promise<unknown> | unknown`
  - 可选
  - 在某个变更操作执行前，此函数将被调用。
  - 如果返回 Promise，则会等待其执行完成

## 全局回调

`MutationCache` 上的 `onError`、`onSuccess`、`onSettled` 和 `onMutate` 回调可用于全局处理这些事件。它们与提供给 `QueryClient` 的 `defaultOptions` 不同，原因在于：

- `defaultOptions` 可以被每个 Mutation 覆盖 —— 而全局回调 **始终** 会被调用。
- `onMutate` 不允许返回上下文值。

## `mutationCache.getAll`

`getAll` 返回缓存中的所有变更操作。

> 注意：大多数应用通常不需要此方法，但在需要获取变更操作的更多信息时可能会派上用场

```tsx
const mutations = mutationCache.getAll()
```

**返回值**

- `Mutation[]`
  - 缓存中的变更操作实例

## `mutationCache.subscribe`

`subscribe` 方法可用于订阅整个变更缓存，并在缓存发生安全/已知的更新（如变更状态更改或变更操作被更新、添加或删除）时收到通知。

```tsx
const callback = (event) => {
  console.log(event.type, event.mutation)
}

const unsubscribe = mutationCache.subscribe(callback)
```

**配置项**

- `callback: (mutation?: MutationCacheNotifyEvent) => void`
  - 每当缓存更新时，此函数将被调用并传入变更缓存事件。

**返回值**

- `unsubscribe: Function => void`
  - 此函数用于取消订阅变更缓存的回调。

## `mutationCache.clear`

`clear` 方法可用于完全清空缓存并重新开始。

```tsx
mutationCache.clear()
```
