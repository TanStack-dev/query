---
source-updated-at: '2025-03-18T11:09:51.000Z'
translation-updated-at: '2025-05-06T03:50:39.683Z'
id: QueryObserver
title: QueryObserver
---

## QueryObserver

`QueryObserver` 可用于观察并在多个查询之间切换。

```tsx
const observer = new QueryObserver(queryClient, { queryKey: ['posts'] })

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

**配置选项**

`QueryObserver` 的选项与 [`useQuery`](../../framework/react/reference/useQuery) 的选项完全一致。
