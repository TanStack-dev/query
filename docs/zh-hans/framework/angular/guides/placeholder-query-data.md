---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-06T04:58:48.269Z'
id: placeholder-query-data
title: 占位查询数据
---

## 什么是占位数据？

占位数据允许查询表现得好像已经拥有数据，类似于 `initialData` 选项，但**这些数据不会被持久化到缓存中**。这在以下场景中非常有用：当实际数据还在后台获取时，你已经拥有足够的局部（或模拟）数据来成功渲染查询。

> 示例：一篇博客文章的查询可以从父级博客列表拉取仅包含标题和文章片段缩略的"预览"数据。你可能不希望将这些局部数据持久化到独立查询的结果中，但它能帮助在完整数据获取完成前尽可能快地展示内容布局。

在需要实际数据前，有几种方式可以为查询提供占位数据到缓存：

- 声明式：
  - 为查询提供 `placeholderData` 以便在缓存为空时预填充
- 命令式：
  - [使用 `queryClient` 和 `placeholderData` 选项预取或获取数据](./prefetching.md)

当我们使用 `placeholderData` 时，查询不会处于 `pending` 状态——它会直接从 `success` 状态开始，因为已有可展示的 `data`（即使只是"占位"数据）。为了与"真实"数据区分，查询结果中还会将 `isPlaceholderData` 标志设为 `true`。

## 作为值的占位数据

```ts
class TodosComponent {
  result = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData: placeholderTodos,
  }))
}
```

## 作为函数的占位数据

`placeholderData` 也可以是一个函数，通过它你能访问"先前"成功查询的数据和元信息。这在需要将一个查询的数据作为另一个查询的占位数据时非常实用。当 QueryKey 变化时（例如从 `['todos', 1]` 变为 `['todos', 2]`），我们可以继续显示"旧"数据，避免在数据从一个查询过渡到下一个时展示加载动画。更多信息请参阅[分页查询](./paginated-queries.md)。

```ts
class TodosComponent {
  result = injectQuery(() => ({
    queryKey: ['todos', id()],
    queryFn: () => fetch(`/todos/${id}`),
    placeholderData: (previousData, previousQuery) => previousData,
  }))
}
```

### 从缓存获取占位数据

某些情况下，你可以从其他查询的缓存结果中提供占位数据。一个典型场景是：从博客文章列表查询的缓存数据中搜索文章的预览版本，然后将其用作独立文章查询的占位数据：

```ts
export class BlogPostComponent {
  // 在 Angular 支持基于信号的输入前，我们需要手动设置信号
  @Input({ required: true, alias: 'postId' })
  set _postId(value: number) {
    this.postId.set(value)
  }
  postId = signal(0)
  queryClient = inject(QueryClient)

  result = injectQuery(() => ({
    queryKey: ['blogPost', this.postId()],
    queryFn: () => fetch(`/blogPosts/${this.postId()}`),
    placeholderData: () => {
      // 使用 'blogPosts' 查询中的精简/预览版博客文章
      // 作为当前博客文章查询的占位数据
      return queryClient
        .getQueryData(['blogPosts'])
        ?.find((d) => d.id === this.postId())
    },
  }))
}
```
