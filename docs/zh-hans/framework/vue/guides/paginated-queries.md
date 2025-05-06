---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:11:58.853Z'
id: paginated-queries
title: 分页查询
---

分页/滞后查询

渲染分页数据是一种非常常见的 UI 模式，在 TanStack Query 中，只需将页码信息包含在查询键 (query key) 中即可"开箱即用"：

```tsx
const result = useQuery({
  queryKey: ['projects', page],
  queryFn: fetchProjects,
})
```

然而，当你运行这个简单示例时，可能会注意到一个奇怪的现象：

**UI 会在 `success` 和 `pending` 状态之间来回跳转，因为每个新页面都被视为一个全新的查询。**

这种体验并不理想，但不幸的是，这正是当今许多工具的工作方式。但 TanStack Query 不同！正如你可能猜到的，TanStack Query 提供了一个名为 `placeholderData` 的强大功能来解决这个问题。

## 使用 `placeholderData` 实现更好的分页查询

考虑以下示例，我们理想情况下希望递增查询的 pageIndex（或游标）。如果使用 `useQuery`，**技术上仍然可以正常工作**，但随着为每个页面或游标创建和销毁不同的查询，UI 仍会在 `success` 和 `pending` 状态之间跳转。通过将 `placeholderData` 设置为 `(previousData) => previousData` 或使用 TanStack Query 导出的 `keepPreviousData` 函数，我们可以获得以下新特性：

- **即使查询键 (query key) 已更改，在请求新数据时仍可访问上次成功获取的数据**
- 当新数据到达时，会无缝切换之前的 `data` 以显示新数据
- 可通过 `isPlaceholderData` 了解查询当前提供的数据类型

```vue
<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'

const fetcher = (page: Ref<number>) =>
  fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${page.value}&_limit=10`,
  ).then((response) => response.json())

const page = ref(1)
const { isPending, isError, data, error, isFetching, isPlaceholderData } =
  useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetcher(page),
    placeholderData: keepPreviousData,
  })
const prevPage = () => {
  page.value = Math.max(page.value - 1, 1)
}
const nextPage = () => {
  if (!isPlaceholderData.value) {
    page.value = page.value + 1
  }
}
</script>

<template>
  <h1>Posts</h1>
  <p>Current Page: {{ page }} | Previous data: {{ isPlaceholderData }}</p>
  <button @click="prevPage">上一页</button>
  <button @click="nextPage">下一页</button>
  <div v-if="isPending">加载中...</div>
  <div v-else-if="isError">发生错误: {{ error }}</div>
  <div v-else-if="data">
    <ul>
      <li v-for="item in data" :key="item.id">
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>
```

## 使用 `placeholderData` 实现滞后无限查询结果

虽然不太常见，但 `placeholderData` 选项与 `useInfiniteQuery` 钩子也能完美配合，因此你可以无缝地让用户在无限查询键随时间变化时继续查看缓存数据。
