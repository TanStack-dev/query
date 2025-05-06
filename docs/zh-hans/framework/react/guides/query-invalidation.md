---
source-updated-at: '2025-03-25T15:32:47.000Z'
translation-updated-at: '2025-05-06T04:09:50.856Z'
id: query-invalidation
title: 查询失效
---
## 查询失效 (Query Invalidation)

单纯等待查询因陈旧而重新获取并不总是有效，特别是当您明确知道由于用户操作导致某查询数据已过期时。为此，`QueryClient` 提供了 `invalidateQueries` 方法，允许您智能地将查询标记为陈旧状态，并可能触发重新获取！

[//]: # '示例'

```tsx
// 使缓存中的所有查询失效
queryClient.invalidateQueries()
// 使所有以 `todos` 开头的键的查询失效
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

[//]: # '示例'

> 注意：其他使用规范化缓存 (normalized caches) 的库会尝试通过命令式或模式推断来用新数据更新本地查询，而 TanStack Query 则为您提供工具来避免维护规范化缓存所需的手动操作，转而采用**定向失效、后台重新获取及最终的原子级更新**策略。

当使用 `invalidateQueries` 使查询失效时，会发生两件事：

- 该查询被标记为陈旧。此状态会覆盖 `useQuery` 或相关钩子中配置的任何 `staleTime` 值
- 如果该查询当前正通过 `useQuery` 或相关钩子渲染，还会在后台触发重新获取

## 通过 `invalidateQueries` 进行查询匹配

在使用 `invalidateQueries`、`removeQueries` 等支持部分查询匹配的 API 时，您可以通过前缀匹配多个查询，或精确匹配特定查询。关于可使用的过滤器类型，请参阅[查询过滤器](./filters.md#query-filters)。

以下示例中，我们使用 `todos` 前缀来使所有查询键以 `todos` 开头的查询失效：

[//]: # '示例2'

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

// 从上下文中获取 QueryClient
const queryClient = useQueryClient()

queryClient.invalidateQueries({ queryKey: ['todos'] })

// 下面的两个查询都将失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
const todoListQuery = useQuery({
  queryKey: ['todos', { page: 1 }],
  queryFn: fetchTodoList,
})
```

[//]: # '示例2'

您还可以通过向 `invalidateQueries` 方法传递更具体的查询键，来使带有特定变量的查询失效：

[//]: # '示例3'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos', { type: 'done' }],
})

// 下面的查询将失效
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})

// 但下面的查询不会失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
```

[//]: # '示例3'

`invalidateQueries` API 非常灵活，如果您**只想**使那些没有额外变量或子键的 `todos` 查询失效，可以向 `invalidateQueries` 方法传递 `exact: true` 选项：

[//]: # '示例4'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: true,
})

// 下面的查询将失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})

// 但下面的查询不会失效
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})
```

[//]: # '示例4'

如果需要**更精细**的控制，可以向 `invalidateQueries` 方法传递一个断言函数。该函数会接收查询缓存中的每个 `Query` 实例，您可以通过返回 `true` 或 `false` 来决定是否使该查询失效：

[//]: # '示例5'

```tsx
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' && query.queryKey[1]?.version >= 10,
})

// 下面的查询将失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 20 }],
  queryFn: fetchTodoList,
})

// 下面的查询将失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 10 }],
  queryFn: fetchTodoList,
})

// 但下面的查询不会失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 5 }],
  queryFn: fetchTodoList,
})
```

[//]: # '示例5'
