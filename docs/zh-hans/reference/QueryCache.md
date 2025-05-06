---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-06T03:56:14.760Z'
id: QueryCache
title: QueryCache
---
`QueryCache` 是 TanStack Query 的存储机制，用于存储其包含的所有查询数据、元信息和状态。

**通常情况下，您不会直接与 QueryCache 交互，而是通过 `QueryClient` 来操作特定缓存。**

```tsx
import { QueryCache } from '@tanstack/react-query'

const queryCache = new QueryCache({
  onError: (error) => {
    console.log(error)
  },
  onSuccess: (data) => {
    console.log(data)
  },
  onSettled: (data, error) => {
    console.log(data, error)
  },
})

const query = queryCache.find(['posts'])
```

其提供的方法包括：

- [`find`](#querycachefind)
- [`findAll`](#querycachefindall)
- [`subscribe`](#querycachesubscribe)
- [`clear`](#querycacheclear)

**配置项**

- `onError?: (error: unknown, query: Query) => void`
  - 可选
  - 当某个查询发生错误时调用此函数。
- `onSuccess?: (data: unknown, query: Query) => void`
  - 可选
  - 当某个查询成功时调用此函数。
- `onSettled?: (data: unknown | undefined, error: unknown | null, query: Query) => void`
  - 可选
  - 当某个查询完成（无论成功或失败）时调用此函数。

## `queryCache.find`

`find` 是一个略微高级的同步方法，可用于从缓存中获取现有的查询实例。该实例不仅包含查询的**所有**状态，还包括所有实例和查询的底层实现细节。如果查询不存在，则返回 `undefined`。

> 注意：大多数应用通常不需要此方法，但在需要获取查询更多信息的罕见场景中会很有用（例如通过检查 `query.state.dataUpdatedAt` 时间戳来决定查询数据是否足够新鲜可用作初始值）

```tsx
const query = queryCache.find(queryKey)
```

**配置项**

- `filters?: QueryFilters`: [查询过滤器](../../framework/react/guides/filters#query-filters)

**返回值**

- `Query`
  - 来自缓存的查询实例

## `queryCache.findAll`

`findAll` 是更高级的同步方法，可用于从缓存中获取部分匹配查询键的所有现有查询实例。如果查询不存在，则返回空数组。

> 注意：大多数应用通常不需要此方法，但在需要获取查询更多信息的罕见场景中会很有用

```tsx
const queries = queryCache.findAll(queryKey)
```

**配置项**

- `queryKey?: QueryKey`: [查询键](../../framework/react/guides/query-keys)
- `filters?: QueryFilters`: [查询过滤器](../../framework/react/guides/filters#query-filters)

**返回值**

- `Query[]`
  - 来自缓存的查询实例数组

## `queryCache.subscribe`

`subscribe` 方法可用于订阅整个查询缓存，并在缓存发生安全/已知的更新时（如查询状态变更、查询被更新/添加/删除）接收通知

```tsx
const callback = (event) => {
  console.log(event.type, event.query)
}

const unsubscribe = queryCache.subscribe(callback)
```

**配置项**

- `callback: (event: QueryCacheNotifyEvent) => void`
  - 当缓存通过其跟踪的更新机制（例如 `query.setState`、`queryClient.removeQueries` 等）更新时，会调用此函数。不鼓励对缓存进行超出范围的修改，此类操作不会触发订阅回调

**返回值**

- `unsubscribe: Function => void`
  - 调用此函数可取消订阅缓存。

## `queryCache.clear`

`clear` 方法可用于完全清空缓存并重新开始。

```tsx
queryCache.clear()
```

[//]: # 'Materials'

## 扩展阅读

要更深入理解 QueryCache 的内部工作原理，请参阅社区资源中的 [#18: React Query 内部机制](../../framework/react/community/tkdodos-blog#18-inside-react-query)。

[//]: # 'Materials'
