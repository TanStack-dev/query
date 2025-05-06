---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:05:23.340Z'
id: placeholder-query-data
title: 占位查询数据
---
## 什么是占位数据？

占位数据允许查询表现得好像它已经有数据一样，类似于 `initialData` 选项，但**这些数据不会持久化到缓存中**。这在以下场景中非常有用：当实际数据在后台获取时，你已经拥有足够的局部（或模拟）数据来成功渲染查询。

> 示例：一篇博客文章的查询可以从父级博客文章列表中提取“预览”数据，该列表仅包含标题和文章正文的一小段。你可能不希望将这些局部数据持久化到单个查询的结果中，但它对于尽快显示内容布局非常有用，而实际查询会继续获取完整对象。

有几种方式可以在需要之前为查询提供占位数据：

- 声明式：
  - 为查询提供 `placeholderData`，以便在缓存为空时预填充数据
- 命令式：
  - [使用 `queryClient` 和 `placeholderData` 选项预取或获取数据](./prefetching.md)

当我们使用 `placeholderData` 时，查询不会处于 `pending` 状态——它会直接从 `success` 状态开始，因为我们有数据可以显示，即使这些数据只是“占位”数据。为了将其与“真实”数据区分开来，查询结果还会将 `isPlaceholderData` 标志设置为 `true`。

## 作为值的占位数据

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  placeholderData: placeholderTodos,
})
```

## 作为函数的占位数据

`placeholderData` 也可以是一个函数，你可以通过它访问“先前”成功查询的数据和查询元信息。这在你想将一个查询的数据用作另一个查询的占位数据时非常有用。当查询键（QueryKey）发生变化时（例如从 `['todos', 1]` 变为 `['todos', 2]`），我们可以继续显示“旧”数据，而不必在数据从一个查询过渡到下一个查询时显示加载动画。更多信息请参阅[分页查询](./paginated-queries.md)。

```tsx
const result = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetch(`/todos/${id}`),
  placeholderData: (previousData, previousQuery) => previousData,
})
```

### 从缓存中获取占位数据

在某些情况下，你可以从另一个查询的缓存结果中为当前查询提供占位数据。一个典型的例子是从博客文章列表查询的缓存数据中搜索文章的预览版本，然后将其用作单个文章查询的占位数据：

```tsx
const result = useQuery({
  queryKey: ['blogPost', blogPostId],
  queryFn: () => fetch(`/blogPosts/${blogPostId}`),
  placeholderData: () => {
    // 使用 'blogPosts' 查询中较小/预览版本的博客文章作为当前查询的占位数据
    return queryClient
      .getQueryData(['blogPosts'])
      ?.find((d) => d.id === blogPostId)
  },
})
```
