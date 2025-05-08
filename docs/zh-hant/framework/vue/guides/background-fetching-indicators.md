---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:19:00.063Z'
id: background-fetching-indicators
title: 背景獲取指示器
---

## 背景擷取指示器 (Background Fetching Indicators)

查詢的 `status === 'pending'` 狀態足以顯示查詢的初始硬載入狀態，但有時您可能希望顯示額外的指示器，表示查詢正在背景中重新擷取。為此，查詢還提供了一個 `isFetching` 布林值，您可以用來顯示它正在擷取狀態，無論 `status` 變數的狀態為何：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})
</script>

<template>
  <div v-if="isFetching">正在重新整理...</div>
  <span v-if="isPending">載入中...</span>
  <span v-else-if="isError">錯誤：{{ error.message }}</span>
  <!-- 此時我們可以假設 `isSuccess === true` -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

## 顯示全域背景擷取載入狀態 (Displaying Global Background Fetching Loading State)

除了個別查詢的載入狀態外，如果您希望在**任何**查詢正在擷取時（包括在背景中）顯示全域載入指示器，可以使用 `useIsFetching` 鉤子 (hook)：

```vue
<script setup>
import { useIsFetching } from '@tanstack/vue-query'

const isFetching = useIsFetching()
</script>

<template>
  <div v-if="isFetching">查詢正在背景中擷取...</div>
</template>
```
