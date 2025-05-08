---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-08T20:15:30.240Z'
id: quick-start
title: 快速開始
---

這段程式碼片段簡要說明了 Vue Query 的 3 個核心概念：

- [查詢 (Queries)](./guides/queries.md)
- [變更 (Mutations)](./guides/mutations.md)
- [查詢失效 (Query Invalidation)](./guides/query-invalidation.md)

如果您需要一個完整可運行的範例，請參考我們的 [基本 codesandbox 範例](../examples/basic)

```vue
<script setup>
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query'

// Access QueryClient instance
const queryClient = useQueryClient()

// Query
const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})

// Mutation
const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})

function onButtonClick() {
  mutation.mutate({
    id: Date.now(),
    title: 'Do Laundry',
  })
}
</script>

<template>
  <span v-if="isPending">Loading...</span>
  <span v-else-if="isError">Error: {{ error.message }}</span>
  <!-- We can assume by this point that `isSuccess === true` -->
  <ul v-else>
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
  <button @click="onButtonClick">Add Todo</button>
</template>
```

這三個概念構成了 Vue Query 的大部分核心功能。接下來的文件章節將會詳細說明每個核心概念。
