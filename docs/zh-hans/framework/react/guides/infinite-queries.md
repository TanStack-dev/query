---
source-updated-at: '2024-11-18T17:22:25.000Z'
translation-updated-at: '2025-05-06T04:13:56.367Z'
id: infinite-queries
title: 无限查询
---

## 无限查询 (Infinite Queries)

能够以增量方式"加载更多"数据到现有数据集或实现"无限滚动"的列表渲染，是一种非常常见的 UI 模式。TanStack Query 为此提供了一个名为 `useInfiniteQuery` 的特殊版本 `useQuery` 来查询这类列表。

使用 `useInfiniteQuery` 时，您会注意到以下几点不同：

- `data` 现在是一个包含无限查询数据的对象：
  - `data.pages` 数组包含已获取的页面
  - `data.pageParams` 数组包含用于获取页面的参数
- 现在可以使用 `fetchNextPage` 和 `fetchPreviousPage` 函数（`fetchNextPage` 是必需的）
- 新增了 `initialPageParam` 选项（且必需）用于指定初始页面参数
- 新增了 `getNextPageParam` 和 `getPreviousPageParam` 选项，用于确定是否有更多数据要加载以及获取这些数据所需的信息。这些信息会作为查询函数的附加参数提供
- 新增了 `hasNextPage` 布尔值，当 `getNextPageParam` 返回值不是 `null` 或 `undefined` 时为 `true`
- 新增了 `hasPreviousPage` 布尔值，当 `getPreviousPageParam` 返回值不是 `null` 或 `undefined` 时为 `true`
- 新增了 `isFetchingNextPage` 和 `isFetchingPreviousPage` 布尔值，用于区分后台刷新状态和加载更多状态

> 注意：选项 `initialData` 或 `placeholderData` 需要遵循与包含 `data.pages` 和 `data.pageParams` 属性的对象相同的结构。

## 示例

假设我们有一个 API，它基于 `cursor` 索引每次返回 3 个 `projects` 页面，同时返回可用于获取下一组项目的游标：

```tsx
fetch('/api/projects?cursor=0')
// { data: [...], nextCursor: 3}
fetch('/api/projects?cursor=3')
// { data: [...], nextCursor: 6}
fetch('/api/projects?cursor=6')
// { data: [...], nextCursor: 9}
fetch('/api/projects?cursor=9')
// { data: [...] }
```

利用这些信息，我们可以通过以下方式创建一个"加载更多"的 UI：

- 默认等待 `useInfiniteQuery` 请求第一组数据
- 在 `getNextPageParam` 中返回下一个查询的信息
- 调用 `fetchNextPage` 函数

[//]: # '示例'

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

function Projects() {
  const fetchProjects = async ({ pageParam }) => {
    const res = await fetch('/api/projects?cursor=' + pageParam)
    return res.json()
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })

  return status === 'pending' ? (
    <p>加载中...</p>
  ) : status === 'error' ? (
    <p>错误: {error.message}</p>
  ) : (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.data.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </React.Fragment>
      ))}
      <div>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? '正在加载更多...'
            : hasNextPage
              ? '加载更多'
              : '已加载全部'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? '获取中...' : null}</div>
    </>
  )
}
```

[//]: # '示例'

必须理解的是，在正在进行获取时调用 `fetchNextPage` 会有覆盖后台数据刷新的风险。当同时渲染列表和触发 `fetchNextPage` 时，这种情况变得尤为关键。

请记住，一个 InfiniteQuery 只能有一个正在进行的获取操作。所有页面共享一个缓存条目，尝试同时进行两次获取可能会导致数据覆盖。

如果您希望启用同时获取，可以在 `fetchNextPage` 中使用 `{ cancelRefetch: false }` 选项（默认为 true）。

为了确保无冲突的顺畅查询过程，强烈建议验证查询是否不处于 `isFetching` 状态，特别是当用户不会直接控制该调用时。

[//]: # '示例1'

```jsx
<List onEndReached={() => !isFetchingNextPage && fetchNextPage()} />
```

[//]: # '示例1'

## 当无限查询需要重新获取时会发生什么？

当无限查询变为 `stale` 并需要重新获取时，每组数据会从第一组开始`顺序`获取。这确保了即使底层数据发生变更，我们也不会使用过期的游标，从而避免获取重复记录或跳过记录。如果无限查询的结果从 queryCache 中移除，分页将从初始状态重新开始，仅请求初始组。

## 如何实现双向无限列表？

双向列表可以通过使用 `getPreviousPageParam`、`fetchPreviousPage`、`hasPreviousPage` 和 `isFetchingPreviousPage` 属性和函数来实现。

[//]: # '示例3'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
})
```

[//]: # '示例3'

## 如何以倒序显示页面？

有时您可能希望以倒序显示页面。这种情况下，可以使用 `select` 选项：

[//]: # '示例4'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  select: (data) => ({
    pages: [...data.pages].reverse(),
    pageParams: [...data.pageParams].reverse(),
  }),
})
```

[//]: # '示例4'

## 如何手动更新无限查询？

### 手动移除第一页：

[//]: # '示例5'

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

[//]: # '示例5'

### 手动从单个页面中移除某个值：

[//]: # '示例6'

```tsx
const newPagesArray =
  oldPagesArray?.pages.map((page) =>
    page.filter((val) => val.id !== updatedId),
  ) ?? []

queryClient.setQueryData(['projects'], (data) => ({
  pages: newPagesArray,
  pageParams: data.pageParams,
}))
```

[//]: # '示例6'

### 仅保留第一页：

[//]: # '示例7'

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(0, 1),
  pageParams: data.pageParams.slice(0, 1),
}))
```

[//]: # '示例7'

确保始终保持 pages 和 pageParams 的相同数据结构！

## 如何限制页面数量？

在某些用例中，您可能希望限制查询数据中存储的页面数量以提高性能和用户体验：

- 当用户可以加载大量页面时（内存使用）
- 当需要重新获取包含数十个页面的无限查询时（网络使用：所有页面都会按顺序获取）

解决方案是使用"有限无限查询"。这可以通过将 `maxPages` 选项与 `getNextPageParam` 和 `getPreviousPageParam` 结合使用来实现，以便在需要时双向获取页面。

在以下示例中，查询数据 pages 数组中仅保留 3 页。如果需要重新获取，只会按顺序重新获取 3 页。

[//]: # '示例8'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
  maxPages: 3,
})
```

[//]: # '示例8'

## 如果我的 API 不返回游标怎么办？

如果您的 API 不返回游标，可以将 `pageParam` 用作游标。因为 `getNextPageParam` 和 `getPreviousPageParam` 也会获取当前页面的 `pageParam`，所以可以用它来计算下一个/上一个页面参数。

[//]: # '示例9'

```tsx
return useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage.length === 0) {
      return undefined
    }
    return lastPageParam + 1
  },
  getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    if (firstPageParam <= 1) {
      return undefined
    }
    return firstPageParam - 1
  },
})
```

[//]: # '示例9'
