---
source-updated-at: '2024-03-03T09:42:51.000Z'
translation-updated-at: '2025-05-08T20:18:14.837Z'
id: prefetching
title: 預獲取
---

如果你夠幸運，可能已經足夠了解使用者行為，能在他們需要資料之前預先取得！這種情況下，可以使用 `prefetchQuery` 方法預先取得查詢結果並存入快取：

[//]: # 'ExamplePrefetching'

```tsx
const prefetchTodos = async () => {
  // 此查詢結果會像一般查詢一樣被快取
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetching'

- 若快取中已有此查詢的**最新**資料，則不會重新取得
- 若傳入 `staleTime` 參數（例如 `prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`）且資料已超過指定的 `staleTime` 時限，則會重新取得查詢
- 若預取的查詢沒有對應的 `useQuery` 實例，則會在 `gcTime` 設定的時間後被刪除並進行垃圾回收

## 預取無限查詢 (Prefetching Infinite Queries)

無限查詢 (Infinite Queries) 可像一般查詢一樣預取。預設只會預取第一頁資料，並儲存在指定的 QueryKey 下。若要預取多頁資料，可使用 `pages` 選項，此時需同時提供 `getNextPageParam` 函數：

[//]: # 'ExampleInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // 此查詢結果會像一般查詢一樣被快取
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // 預取前 3 頁
  })
}
```

[//]: # 'ExampleInfiniteQuery'

上述程式碼會依序嘗試預取 3 頁資料，並對每頁執行 `getNextPageParam` 以決定下一頁的預取參數。若 `getNextPageParam` 回傳 `undefined`，則會停止預取。
