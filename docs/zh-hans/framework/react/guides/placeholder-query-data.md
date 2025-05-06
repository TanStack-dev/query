---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:09:43.190Z'
id: placeholder-query-data
title: 占位查询数据
---
## 什么是占位数据 (Placeholder Data)？

占位数据允许查询表现得好像已经拥有数据，类似于 `initialData` 选项，但**这些数据不会被持久化到缓存中**。这在以下场景中非常有用：当实际数据还在后台获取时，你已经拥有部分（或模拟）数据可以成功渲染查询结果。

> 示例：一篇博客文章的查询可以从父级博客列表获取仅包含标题和正文片段缩略的“预览”数据。你可能不希望将这些部分数据持久化到独立查询的结果中，但它对于尽快展示内容布局非常有用，同时实际查询会继续获取完整数据。

有几种方式可以在需要之前为查询提供占位数据：

- 声明式：
  - 为查询提供 `placeholderData`，以便在缓存为空时预填充数据
- 命令式：
  - [使用 `queryClient` 和 `placeholderData` 选项预取或获取数据](./prefetching.md)

当我们使用 `placeholderData` 时，查询不会处于 `pending` 状态——它会直接从 `success` 状态开始，因为我们有可以显示的 `data`，即使这些数据只是“占位”数据。为了将其与“真实”数据区分开，查询结果中还会将 `isPlaceholderData` 标志设为 `true`。

## 作为值的占位数据

[//]: # 'ExampleValue'

```tsx
function Todos() {
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData: placeholderTodos,
  })
}
```

[//]: # 'ExampleValue'
[//]: # 'Memoization'

### 占位数据记忆化 (Memoization)

如果获取查询占位数据的过程计算密集，或者你不想在每次渲染时都执行，可以对值进行记忆化处理：

```tsx
function Todos() {
  const placeholderData = useMemo(() => generateFakeTodos(), [])
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData,
  })
}
```

[//]: # 'Memoization'

## 作为函数的占位数据

`placeholderData` 也可以是一个函数，通过它你可以访问“先前”成功查询的数据和查询元信息。这在你想用一个查询的数据作为另一个查询的占位数据时非常有用。当查询键 (QueryKey) 发生变化时（例如从 `['todos', 1]` 变为 `['todos', 2]`），我们可以继续显示“旧”数据，而不是在数据从一个查询过渡到另一个查询时显示加载状态。更多信息请参阅[分页查询](./paginated-queries.md)。

[//]: # 'ExampleFunction'

```tsx
const result = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetch(`/todos/${id}`),
  placeholderData: (previousData, previousQuery) => previousData,
})
```

[//]: # 'ExampleFunction'

### 从缓存获取占位数据

在某些情况下，你可以从另一个查询的缓存结果中获取占位数据。一个典型的例子是从博客文章列表查询的缓存数据中搜索文章的预览版本，然后将其用作独立文章查询的占位数据：

[//]: # 'ExampleCache'

```tsx
function Todo({ blogPostId }) {
  const queryClient = useQueryClient()
  const result = useQuery({
    queryKey: ['blogPost', blogPostId],
    queryFn: () => fetch(`/blogPosts/${blogPostId}`),
    placeholderData: () => {
      // 使用 'blogPosts' 查询中的小型/预览版博客文章数据
      // 作为当前博客文章查询的占位数据
      return queryClient
        .getQueryData(['blogPosts'])
        ?.find((d) => d.id === blogPostId)
    },
  })
}
```

[//]: # 'ExampleCache'
[//]: # 'Materials'

## 扩展阅读

要比较 `占位数据 (Placeholder Data)` 和 `初始数据 (Initial Data)` 的区别，请查看[社区资源](../community/tkdodos-blog.md#9-placeholder-and-initial-data-in-react-query)。

[//]: # 'Materials'
