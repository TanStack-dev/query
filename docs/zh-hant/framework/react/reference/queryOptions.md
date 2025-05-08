---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:40.534Z'
id: queryOptions
title: queryOptions
---

```tsx
queryOptions({
  queryKey,
  ...options,
})
```

**選項**

通常你可以傳遞所有能傳給 [`useQuery`](./useQuery.md) 的參數到 `queryOptions`。某些選項在被轉發到像 `queryClient.prefetchQuery` 這類函數時會無效，但 TypeScript 仍會容許這些多餘的屬性。

- `queryKey: QueryKey`
  - **必填**
  - 用於生成選項的查詢鍵 (query key)。
- `experimental_prefetchInRender?: boolean`
  - 選填
  - 預設為 `false`
  - 設為 `true` 時，查詢會在渲染期間預先獲取 (prefetch)，這對某些優化情境很有用
  - 需啟用此選項才能使用實驗性的 `useQuery().promise` 功能
