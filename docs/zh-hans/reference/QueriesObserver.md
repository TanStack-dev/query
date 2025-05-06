---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-06T03:50:00.104Z'
id: QueriesObserver
title: QueriesObserver
---

## `QueriesObserver`

`QueriesObserver` 可用于观察多个查询。

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

**选项**

`QueriesObserver` 的选项与 [`useQueries`](../../framework/react/reference/useQueries) 完全一致。
