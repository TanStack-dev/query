---
source-updated-at: '2025-04-12T20:05:20.000Z'
translation-updated-at: '2025-05-08T20:19:14.763Z'
id: useSuspenseQueries
title: useSuspenseQueries
---

```tsx
const result = useSuspenseQueries(options)
```

**選項**

與 [useQueries](../reference/useQueries.md) 相同，但每個 `query` 不能包含以下屬性：

- `suspense`
- `throwOnError`
- `enabled`
- `placeholderData`

**返回值**

結構與 [useQueries](../reference/useQueries.md) 相同，但針對每個 `query` 有以下差異：

- `data` 保證會被定義
- `isPlaceholderData` 不存在
- `status` 僅會是 `success` 或 `error`
  - 衍生的標誌會相應地設定

**注意事項**

請注意，元件只會在**所有查詢**完成載入後才會重新掛載。因此，如果在所有查詢完成的時間內有查詢變為過時 (stale)，重新掛載時會再次獲取資料。為避免此情況，請確保設定足夠高的 `staleTime`。

[取消查詢](../guides/query-cancellation.md) 功能在此不適用。
