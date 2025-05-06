---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:09:46.316Z'
id: query-functions
title: 查询函数
---

# 查询函数 (Query Functions)

查询函数可以是**任何返回 Promise 的函数**。返回的 Promise 应当**解析数据 (resolve the data)** 或**抛出错误 (throw an error)**。

以下都是有效的查询函数配置方式：

[//]: # 'Example'

```tsx
useQuery({ queryKey: ['todos'], queryFn: fetchAllTodos })
useQuery({ queryKey: ['todos', todoId], queryFn: () => fetchTodoById(todoId) })
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const data = await fetchTodoById(todoId)
    return data
  },
})
useQuery({
  queryKey: ['todos', todoId],
  queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]),
})
```

[//]: # 'Example'

## 错误处理与抛出

为了让 TanStack Query 判定查询发生了错误，查询函数**必须抛出错误**或返回一个**被拒绝的 Promise (rejected Promise)**。在查询函数中抛出的任何错误都会被持久化到查询的 `error` 状态中。

[//]: # 'Example2'

```tsx
const { error } = useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    if (somethingGoesWrong) {
      throw new Error('Oh no!')
    }
    if (somethingElseGoesWrong) {
      return Promise.reject(new Error('Oh no!'))
    }

    return data
  },
})
```

[//]: # 'Example2'

## 与 `fetch` 等默认不抛出错误的客户端一起使用

虽然大多数工具如 `axios` 或 `graphql-request` 会自动为不成功的 HTTP 调用抛出错误，但像 `fetch` 这样的工具默认不会抛出错误。如果是这种情况，你需要自行抛出错误。以下是使用流行的 `fetch` API 实现这一点的简单方法：

[//]: # 'Example3'

```tsx
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const response = await fetch('/todos/' + todoId)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})
```

[//]: # 'Example3'

## 查询函数变量 (Query Function Variables)

查询键 (Query keys) 不仅用于唯一标识你要获取的数据，还会作为 QueryFunctionContext 的一部分方便地传递到你的查询函数中。虽然并非总是必要，但这使得在需要时可以提取查询函数：

[//]: # 'Example4'

```tsx
function Todos({ status, page }) {
  const result = useQuery({
    queryKey: ['todos', { status, page }],
    queryFn: fetchTodoList,
  })
}

// 在查询函数中访问 key、status 和 page 变量！
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

[//]: # 'Example4'

### 查询函数上下文 (QueryFunctionContext)

`QueryFunctionContext` 是传递给每个查询函数的对象，包含以下属性：

- `queryKey: QueryKey`: [查询键 (Query Keys)](./query-keys.md)
- `client: QueryClient`: [QueryClient](../../../reference/QueryClient.md)
- `signal?: AbortSignal`
  - 由 TanStack Query 提供的 [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) 实例
  - 可用于 [查询取消 (Query Cancellation)](./query-cancellation.md)
- `meta: Record<string, unknown> | undefined`
  - 可选字段，可填充有关查询的附加信息

此外，[无限查询 (Infinite Queries)](./infinite-queries.md) 还会传递以下选项：

- `pageParam: TPageParam`
  - 用于获取当前页面的页面参数
- `direction: 'forward' | 'backward'`
  - **已弃用**
  - 当前页面获取的方向
  - 要获取当前页面获取的方向，请从 `getNextPageParam` 和 `getPreviousPageParam` 向 `pageParam` 添加方向信息
