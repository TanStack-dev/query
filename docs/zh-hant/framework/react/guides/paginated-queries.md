---
source-updated-at: '2024-07-18T12:50:17.000Z'
translation-updated-at: '2025-05-08T20:22:40.353Z'
id: paginated-queries
title: 分頁查詢
---

在 UI 中渲染分頁資料是非常常見的模式，而在 TanStack Query 中，只需將頁面資訊包含在查詢鍵 (query key) 中就能「直接運作」：

[//]: # 'Example'

```tsx
const result = useQuery({
  queryKey: ['projects', page],
  queryFn: fetchProjects,
})
```

[//]: # 'Example'

然而，當你執行這個簡單範例時，可能會注意到一個奇怪的現象：

**UI 會在 `success` 和 `pending` 狀態之間跳動，因為每個新頁面都被視為一個全新的查詢。**

這種體驗並不理想，但不幸的是，這也是目前許多工具堅持的運作方式。不過 TanStack Query 可不一樣！如你所料，TanStack Query 提供了一個名為 `placeholderData` 的強大功能來解決這個問題。

## 使用 `placeholderData` 實現更好的分頁查詢

考慮以下範例，我們希望逐步增加查詢的頁面索引 (pageIndex) 或游標 (cursor)。如果使用 `useQuery`，**技術上雖然仍能正常運作**，但當不同頁面或游標建立和銷毀各自的查詢時，UI 會在 `success` 和 `pending` 狀態之間跳動。透過將 `placeholderData` 設為 `(previousData) => previousData` 或使用 TanStack Query 導出的 `keepPreviousData` 函數，我們可以獲得以下優勢：

- **即使查詢鍵已改變，上次成功取得的資料仍會在新資料請求期間保持可用**。
- 當新資料到達時，系統會無縫切換顯示新資料。
- 可透過 `isPlaceholderData` 判斷當前查詢提供的資料類型

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

## 使用 `placeholderData` 延遲無限查詢結果

雖然較不常見，但 `placeholderData` 選項也能完美搭配 `useInfiniteQuery` 鉤子 (hook) 使用，讓使用者在無限查詢鍵隨時間變化的同時，仍能無縫查看快取的資料。
