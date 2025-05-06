---
source-updated-at: '2025-03-31T09:10:17.000Z'
translation-updated-at: '2025-05-06T04:33:00.266Z'
id: useSuspenseQuery
title: useSuspenseQuery
---
```tsx
const result = useSuspenseQuery(options)
```

**参数选项**

与 [useQuery](../reference/useQuery.md) 相同，但以下参数除外：

- `throwOnError`
- `enabled`
- `placeholderData`

**返回值**

返回对象与 [useQuery](../reference/useQuery.md) 相同，但存在以下差异：

- `data` 保证已定义（非 undefined）
- 不包含 `isPlaceholderData` 字段
- `status` 始终为 `success` 状态
  - 所有衍生标志位会相应设置

**注意事项**

[查询取消 (Cancellation)](../guides/query-cancellation.md) 功能不可用
