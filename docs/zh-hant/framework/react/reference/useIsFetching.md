---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:31.746Z'
id: useIsFetching
title: useIsFetching
---

`useIsFetching` 是一個可選用的鉤子 (hook)，它會回傳你的應用程式正在背景載入或擷取中的查詢 `數量`（適用於全應用程式的載入指示器）。

```tsx
import { useIsFetching } from '@tanstack/react-query'
// 有多少查詢正在擷取中？
const isFetching = useIsFetching()
// 符合 posts 前綴的查詢有多少正在擷取中？
const isFetchingPosts = useIsFetching({ queryKey: ['posts'] })
```

**選項**

- `filters?: QueryFilters`: [查詢過濾器](../guides/filters.md#query-filters)
- `queryClient?: QueryClient`,
  - 使用此選項可指定自訂的 QueryClient。若未提供，則會使用最近上下文中的 QueryClient。

**回傳值**

- `isFetching: number`
  - 此數值代表你的應用程式目前正在背景載入或擷取中的查詢數量。
