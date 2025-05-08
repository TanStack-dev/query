---
source-updated-at: '2024-09-20T19:45:40.000Z'
translation-updated-at: '2025-05-08T20:15:12.474Z'
id: infinite-query-property-order
title: 無限查詢屬性順序
---

對於以下函式，由於型別推論的關係，傳入物件的屬性順序會影響結果：

- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`
- `infiniteQueryOptions`

正確的屬性順序應如下：

- `queryFn`
- `getPreviousPageParam`
- `getNextPageParam`

其餘屬性則不受順序影響，因為它們不依賴型別推論。

## 規則詳情

以下為 **錯誤** 的程式碼範例：

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  maxPages: 3,
})
```

以下為 **正確** 的程式碼範例：

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  maxPages: 3,
})
```

## 屬性

- [x] ✅ 推薦
- [x] 🔧 可自動修正
