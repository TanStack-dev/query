---
source-updated-at: '2024-12-03T07:43:25.000Z'
translation-updated-at: '2025-05-08T20:17:51.417Z'
id: query-keys
title: Query Keys
ref: docs/zh-hant/framework/react/guides/query-keys.md
---

[//]: # 'Example5'

```js
function useTodos(todoId) {
  const queryKey = ['todos', todoId]
  return useQuery({
    queryKey,
    queryFn: () => fetchTodoById(todoId.value),
  })
}
```

[//]: # 'Example5'
