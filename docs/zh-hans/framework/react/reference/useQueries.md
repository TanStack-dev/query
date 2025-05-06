---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:36:21.202Z'
id: useQueries
title: useQueries
---
`useQueries` 钩子可用于获取可变数量的查询：

```tsx
const ids = [1, 2, 3]
const results = useQueries({
  queries: ids.map((id) => ({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    staleTime: Infinity,
  })),
})
```

**选项**

`useQueries` 钩子接收一个配置对象，其中 **queries** 键的值是一个数组，数组中的查询配置对象与 [`useQuery` 钩子](../reference/useQuery.md) 完全相同（不包括 `queryClient` 选项 —— 因为 `QueryClient` 可以在顶层传入）。

- `queryClient?: QueryClient`
  - 用于提供自定义的 QueryClient。否则会使用最近上下文中的实例。
- `combine?: (result: UseQueriesResults) => TCombinedResult`
  - 用于将多个查询结果合并为单个值。

> 在查询对象数组中多次使用相同的查询键可能导致查询间共享数据。为避免这种情况，建议对查询进行去重，并将结果映射回所需结构。

**placeholderData**

`useQueries` 同样支持 `placeholderData` 选项，但由于 `useQueries` 的输入可能在每次渲染时具有不同数量的查询，因此它不会像 `useQuery` 那样从先前渲染的查询中获取信息。

**返回值**

`useQueries` 钩子返回一个包含所有查询结果的数组，返回顺序与输入顺序一致。

## 合并结果

若需要将结果中的 `data`（或其他查询信息）合并为单个值，可以使用 `combine` 选项。合并结果会通过结构共享尽可能保持引用稳定。

```tsx
const ids = [1, 2, 3]
const combinedQueries = useQueries({
  queries: ids.map((id) => ({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  })),
  combine: (results) => {
    return {
      data: results.map((result) => result.data),
      pending: results.some((result) => result.isPending),
    }
  },
})
```

上例中，`combinedQueries` 将是一个包含 `data` 和 `pending` 属性的对象。注意查询结果的其他属性会被丢弃。

### 记忆化

`combine` 函数仅在以下情况下重新执行：

- `combine` 函数本身的引用发生变化
- 任意查询结果发生变化

这意味着如上所示的内联 `combine` 函数会在每次渲染时运行。为避免这种情况，可以用 `useCallback` 包裹 `combine` 函数，或将其提取为无依赖的稳定函数引用。
