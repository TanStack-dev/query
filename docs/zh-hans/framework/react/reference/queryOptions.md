---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:40:14.841Z'
id: queryOptions
title: queryOptions
---
```tsx
queryOptions({
  queryKey,
  ...options,
})
```

**选项**

通常你可以向 `queryOptions` 传递所有能传递给 [`useQuery`](./useQuery.md) 的参数。部分选项在被转发到类似 `queryClient.prefetchQuery` 的函数时不会生效，但 TypeScript 仍会允许这些额外属性的存在。

- `queryKey: QueryKey`
  - **必填**
  - 用于生成选项的查询键 (query key)
- `experimental_prefetchInRender?: boolean`
  - 可选
  - 默认为 `false`
  - 设为 `true` 时，查询将在渲染期间预取，这对某些优化场景很有用
  - 需要开启此选项才能使用实验性的 `useQuery().promise` 功能
