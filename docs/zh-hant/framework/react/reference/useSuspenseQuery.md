---
source-updated-at: '2025-04-12T20:05:20.000Z'
translation-updated-at: '2025-05-08T20:19:06.636Z'
id: useSuspenseQuery
title: useSuspenseQuery
---

```tsx
const result = useSuspenseQuery(options)
```

**選項**

與 [useQuery](../reference/useQuery.md) 相同，但以下選項除外：

- `throwOnError`
- `enabled`
- `placeholderData`

**回傳值**

回傳物件與 [useQuery](../reference/useQuery.md) 相同，但以下屬性有差異：

- `data` 保證會被定義
- `isPlaceholderData` 不存在
- `status` 只會是 `success` 或 `error`
  - 衍生的狀態標記會相應設置

**注意事項**

[查詢取消 (Cancellation)](../guides/query-cancellation.md) 功能在此不適用。
