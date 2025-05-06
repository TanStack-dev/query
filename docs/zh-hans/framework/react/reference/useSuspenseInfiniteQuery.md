---
source-updated-at: '2025-03-31T09:10:17.000Z'
translation-updated-at: '2025-05-06T04:33:11.338Z'
id: useSuspenseInfiniteQuery
title: useSuspenseInfiniteQuery
---

```tsx
const result = useSuspenseInfiniteQuery(options)
```

**配置项**

与 [useInfiniteQuery](../reference/useInfiniteQuery.md) 相同，但以下选项除外：

- `suspense`
- `throwOnError`
- `enabled`
- `placeholderData`

**返回值**

返回对象与 [useInfiniteQuery](../reference/useInfiniteQuery.md) 相同，但存在以下差异：

- `data` 保证已定义
- 不存在 `isPlaceholderData` 属性
- `status` 始终为 `success`
  - 派生的状态标志会相应设置

**注意事项**

[取消查询](../guides/query-cancellation.md) 功能不可用。
