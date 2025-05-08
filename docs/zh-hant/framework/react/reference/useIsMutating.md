---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:27.705Z'
id: useIsMutating
title: useIsMutating
---

`useIsMutating` 是一個可選的鉤子 (hook)，它會回傳應用程式正在擷取的變異 (mutation) 數量，適用於全應用程式的載入指示器。

```tsx
import { useIsMutating } from '@tanstack/react-query'
// 有多少個變異正在擷取中？
const isMutating = useIsMutating()
// 符合 posts 前綴的變異有多少個正在擷取中？
const isMutatingPosts = useIsMutating({ mutationKey: ['posts'] })
```

**選項**

- `filters?: MutationFilters`: [變異過濾器](../guides/filters.md#mutation-filters)
- `queryClient?: QueryClient`,
  - 使用此選項可指定自訂的 QueryClient，否則將使用最近上下文中的 QueryClient。

**回傳值**

- `isMutating: number`
  - 此數字代表應用程式當前正在擷取的變異數量。
