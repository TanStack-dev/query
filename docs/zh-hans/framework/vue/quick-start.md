---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-03T22:08:17.182Z'
id: quick-start
title: 快速开始
---

以下代码片段简要展示了 Vue Query 的 3 个核心概念：

- [查询 (Queries)](./guides/queries.md)
- [变更 (Mutations)](./guides/mutations.md)
- [查询失效 (Query Invalidation)](./guides/query-invalidation.md)

如需查看完整可运行的示例，请参考我们的 [基础 codesandbox 示例](../examples/basic)

```vue
<script setup>
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query'

// 获取 QueryClient 实例
const queryClient = useQueryClient()

// 查询
const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})

// 变更
const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    // 使查询失效并重新获取
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
  <span v-if="isPending">加载中...</span>
  <span v-else-if="isError">错误: {{ error.message }}</span>
  <!-- 此时可以认为 `isSuccess === true` -->
  <ul v-else>
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
  <button @click="onButtonClick">添加待办事项</button>
</template>
```

这三个概念构成了 Vue Query 的核心功能。文档的后续章节将详细讲解每个核心概念。
