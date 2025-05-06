---
source-updated-at: '2024-07-18T12:50:17.000Z'
translation-updated-at: '2025-05-06T04:09:51.300Z'
id: paginated-queries
title: 分页查询
---
分页数据的渲染是一种非常常见的 UI 模式，在 TanStack Query 中，只需将页码信息包含在查询键 (query key) 中即可"开箱即用"：

[//]: # 'Example'

```tsx
const result = useQuery({
  queryKey: ['projects', page],
  queryFn: fetchProjects,
})
```

[//]: # 'Example'

然而，如果你运行这个简单示例，可能会注意到一个奇怪的现象：

**UI 会在 `success` 和 `pending` 状态之间不断切换，因为每个新页面都被视为一个全新的查询。**

这种体验并不理想，但不幸的是，这正是当今许多工具的工作方式。但 TanStack Query 不同！你可能已经猜到了，TanStack Query 提供了一个名为 `placeholderData` 的强大功能来解决这个问题。

## 使用 `placeholderData` 实现更好的分页查询

考虑以下示例，我们理想情况下希望递增查询的页码 (pageIndex) 或游标 (cursor)。如果使用 `useQuery`，**技术上仍然可以正常工作**，但随着为每个页面创建和销毁不同的查询，UI 会在 `success` 和 `pending` 状态之间跳跃。通过将 `placeholderData` 设置为 `(previousData) => previousData` 或使用 TanStack Query 导出的 `keepPreviousData` 函数，我们可以获得以下改进：

- **即使查询键发生了变化，在请求新数据时，上次成功获取的数据仍然可用**
- 当新数据到达时，之前的 `data` 会无缝切换以显示新数据
- 可以通过 `isPlaceholderData` 判断当前查询提供的是哪类数据

[//]: # 'Example2'

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import React from 'react'

function Todos() {
  const [page, setPage] = React.useState(0)

  const fetchProjects = (page = 0) =>
    fetch('/api/projects?page=' + page).then((res) => res.json())

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['projects', page],
      queryFn: () => fetchProjects(page),
      placeholderData: keepPreviousData,
    })

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          {data.projects.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </div>
      )}
      <span>Current Page: {page + 1}</span>
      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>
      <button
        onClick={() => {
          if (!isPlaceholderData && data.hasMore) {
            setPage((old) => old + 1)
          }
        }}
        // Disable the Next Page button until we know a next page is available
        disabled={isPlaceholderData || !data?.hasMore}
      >
        Next Page
      </button>
      {isFetching ? <span> Loading...</span> : null}
    </div>
  )
}
```

[//]: # 'Example2'

## 使用 `placeholderData` 延迟无限查询结果

虽然不太常见，但 `placeholderData` 选项与 `useInfiniteQuery` 钩子也能完美配合，因此你可以让用户在无限查询键随时间变化时，仍然无缝查看缓存数据。
