---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:37.299Z'
id: infiniteQueryOptions
title: infiniteQueryOptions
---

```tsx
infiniteQueryOptions({
  queryKey,
  ...options,
})
```

**選項**

通常你可以傳遞所有能傳給 [`useInfiniteQuery`](./useInfiniteQuery.md) 的參數給 `infiniteQueryOptions`。某些選項在轉發給像 `queryClient.prefetchInfiniteQuery` 這類函數時不會產生效果，但 TypeScript 仍會容許這些多餘的屬性。

- `queryKey: QueryKey`
  - **必填**
  - 用於生成選項的查詢鍵 (query key)。
