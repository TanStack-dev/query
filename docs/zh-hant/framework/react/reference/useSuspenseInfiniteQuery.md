---
source-updated-at: '2025-04-12T20:05:20.000Z'
translation-updated-at: '2025-05-08T20:19:18.480Z'
id: useSuspenseInfiniteQuery
title: useSuspenseInfiniteQuery
---

```tsx
const result = useSuspenseInfiniteQuery(options)
```

**選項**

與 [useInfiniteQuery](../reference/useInfiniteQuery.md) 相同，但以下選項除外：

- `suspense`
- `throwOnError`
- `enabled`
- `placeholderData`

**回傳值**

回傳物件與 [useInfiniteQuery](../reference/useInfiniteQuery.md) 相同，但以下差異：

- `data` 保證會被定義
- `isPlaceholderData` 不存在
- `status` 只會是 `success` 或 `error`
  - 衍生的狀態標記會相應設定

**注意事項**

[取消查詢](../guides/query-cancellation.md) 功能無法運作。
