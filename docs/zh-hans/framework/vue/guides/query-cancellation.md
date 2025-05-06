---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:26:47.547Z'
id: query-cancellation
title: Query Cancellation
ref: docs/zh-hans/framework/react/guides/query-cancellation.md
---

[//]: # 'Example7'

```ts
const query = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const resp = await fetch('/todos', { signal })
    return resp.json()
  },
})

const queryClient = useQueryClient()

function onButtonClick() {
  queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

[//]: # 'Example7'
