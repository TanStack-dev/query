---
source-updated-at: '2025-03-18T11:09:51.000Z'
translation-updated-at: '2025-05-08T20:14:37.846Z'
id: QueryObserver
title: QueryObserver
---

`QueryObserver` 可用於觀察並切換不同的查詢 (query)。

```tsx
const observer = new QueryObserver(queryClient, { queryKey: ['posts'] })

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

**選項 (Options)**

`QueryObserver` 的選項與 [`useQuery`](../../framework/react/reference/useQuery) 的選項完全相同。
