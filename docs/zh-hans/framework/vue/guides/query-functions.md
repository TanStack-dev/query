---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:26:47.492Z'
id: query-functions
title: Query Functions
ref: docs/zh-hans/framework/react/guides/query-functions.md
---

[//]: # 'Example4'

```js
const result = useQuery({
  queryKey: ['todos', { status, page }],
  queryFn: fetchTodoList,
})

// Access the key, status and page variables in your query function!
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

[//]: # 'Example4'
