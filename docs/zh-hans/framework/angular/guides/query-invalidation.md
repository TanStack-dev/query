---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-06T04:53:07.857Z'
id: query-invalidation
title: 查询失效
---

等待查询自动变陈旧（stale）后再重新获取并不总是适用，尤其是当用户操作明确导致某查询数据过期时。为此，`QueryClient` 提供了 `invalidateQueries` 方法，允许您智能地标记查询为陈旧状态，并可能触发重新获取！

```tsx
// 使缓存中的所有查询失效
queryClient.invalidateQueries()
// 使所有以 `todos` 开头的查询键的查询失效
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

> 注意：其他使用规范化缓存（normalized caches）的库会尝试通过命令式或模式推断来更新本地查询，而 TanStack Query 提供了工具来避免维护规范化缓存的手动操作，转而采用**定向失效（targeted invalidation）、后台重新获取（background-refetching）以及最终的原子更新（atomic updates）**。

当使用 `invalidateQueries` 使查询失效时，会发生两件事：

- 该查询被标记为陈旧（stale）。此状态会覆盖 `injectQuery` 或相关函数中配置的任何 `staleTime` 值
- 如果该查询当前正通过 `injectQuery` 或相关函数渲染，还会在后台触发重新获取

## 使用 `invalidateQueries` 进行查询匹配

在使用 `invalidateQueries` 和 `removeQueries` 等支持部分查询匹配的 API 时，您可以通过前缀匹配多个查询，或精确匹配特定查询。关于可用的筛选器类型，请参阅[查询筛选器](./filters.md#query-filters)。

以下示例中，我们使用 `todos` 前缀来使所有查询键以 `todos` 开头的查询失效：

```ts
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental'

class QueryInvalidationExample {
  queryClient = inject(QueryClient)

  invalidateQueries() {
    this.queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  // 以下两个查询都将失效
  todoListQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
  todoListQuery = injectQuery(() => ({
    queryKey: ['todos', { page: 1 }],
    queryFn: fetchTodoList,
  }))
}
```

您还可以通过传递更具体的查询键，使带特定变量的查询失效：

```ts
queryClient.invalidateQueries({
  queryKey: ['todos', { type: 'done' }],
})

// 以下查询将失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
}))

// 但以下查询不会失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))
```

`invalidateQueries` API 非常灵活。如果您**只想**使不包含额外变量或子键的 `todos` 查询失效，可以传递 `exact: true` 选项：

```ts
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: true,
})

// 以下查询将失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))

// 但以下查询不会失效
const todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
}))
```

如果需要**更精细**的控制，可以向 `invalidateQueries` 方法传递一个断言函数。该函数会接收查询缓存中的每个 `Query` 实例，并让您通过返回 `true` 或 `false` 来决定是否使其失效：

```ts
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' && query.queryKey[1]?.version >= 10,
})

// 以下查询将失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 20 }],
  queryFn: fetchTodoList,
}))

// 以下查询将失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 10 }],
  queryFn: fetchTodoList,
}))

// 但以下查询不会失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 5 }],
  queryFn: fetchTodoList,
}))
```
