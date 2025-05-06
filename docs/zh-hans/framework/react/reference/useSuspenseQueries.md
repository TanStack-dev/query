---
source-updated-at: '2025-03-31T09:10:17.000Z'
translation-updated-at: '2025-05-06T04:27:49.567Z'
id: useSuspenseQueries
title: useSuspenseQueries
---

```tsx
const result = useSuspenseQueries(options)
```

**参数选项**

与 [useQueries](../reference/useQueries.md) 相同，但每个 `query` 不能包含以下属性：

- `suspense`
- `throwOnError`
- `enabled`
- `placeholderData`

**返回值**

返回结构与 [useQueries](../reference/useQueries.md) 相同，但针对每个 `query` 有以下区别：

- `data` 保证已定义
- 不包含 `isPlaceholderData` 属性
- `status` 始终为 `success`
  - 派生的状态标志也会相应设置

**注意事项**

请注意组件只会在**所有查询**完成加载后重新挂载。因此，如果在所有查询完成期间某个查询已过期，重新挂载时会再次发起请求。为避免此问题，请确保设置足够长的 `staleTime`。

[取消查询](../guides/query-cancellation.md) 功能不可用。
