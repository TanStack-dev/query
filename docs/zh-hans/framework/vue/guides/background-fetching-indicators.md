---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:14:09.749Z'
id: background-fetching-indicators
title: 后台获取指示器
---

## 后台获取状态指示器

查询的 `status === 'pending'` 状态足以显示查询的初始加载状态，但有时您可能希望额外显示一个指示器，表明查询正在后台重新获取数据。为此，查询还提供了一个 `isFetching` 布尔值，无论 `status` 变量的状态如何，您都可以用它来显示查询正处于获取状态：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})
</script>

<template>
  <div v-if="isFetching">正在刷新...</div>
  <span v-if="isPending">加载中...</span>
  <span v-else-if="isError">错误: {{ error.message }}</span>
  <!-- 此时可以假设 `isSuccess === true` -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

## 显示全局后台获取加载状态

除了单个查询的加载状态外，如果您希望在**任何**查询（包括后台查询）正在获取数据时显示全局加载指示器，可以使用 `useIsFetching` 钩子：

```vue
<script setup>
import { useIsFetching } from '@tanstack/vue-query'

const isFetching = useIsFetching()
</script>

<template>
  <div v-if="isFetching">正在后台获取查询数据...</div>
</template>
```
