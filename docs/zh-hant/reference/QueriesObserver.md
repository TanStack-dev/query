---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-08T20:14:39.034Z'
id: QueriesObserver
title: QueriesObserver
---

## `QueriesObserver`

`QueriesObserver` 可用於觀察多個查詢 (query)。

```tsx
const observer = new QueriesObserver(queryClient, [
  { queryKey: ['post', 1], queryFn: fetchPost },
  { queryKey: ['post', 2], queryFn: fetchPost },
])

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

**選項**

`QueriesObserver` 的選項與 [`useQueries`](../../framework/react/reference/useQueries) 的選項完全相同。
