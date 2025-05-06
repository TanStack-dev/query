---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:40:23.130Z'
id: infiniteQueryOptions
title: infiniteQueryOptions
---
```tsx
infiniteQueryOptions({
  queryKey,
  ...options,
})
```

**选项配置**

通常你可以向 `infiniteQueryOptions` 传递所有 [`useInfiniteQuery`](./useInfiniteQuery.md) 支持的参数。部分选项在被转发到如 `queryClient.prefetchInfiniteQuery` 这类函数时不会生效，但 TypeScript 仍会允许这些额外的属性存在。

- `queryKey: QueryKey`
  - **必填**
  - 用于生成选项配置的查询键 (Query Key)。
