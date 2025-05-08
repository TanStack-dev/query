---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:38.975Z'
id: paginated-queries
title: 分頁查詢
---

分頁渲染資料是一種非常常見的 UI 模式，在 TanStack Query 中，只需將頁面資訊包含在查詢鍵 (query key) 中即可「直接運作」：

```tsx
const result = useQuery({
  queryKey: ['projects', page],
  queryFn: fetchProjects,
})
```

然而，當你執行這個簡單範例時，可能會注意到一個奇怪的現象：

**UI 會在 `success` 和 `pending` 狀態之間跳動，因為每個新頁面都被視為一個全新的查詢。**

這種體驗並不理想，但不幸的是，這也是目前許多工具堅持的運作方式。不過 TanStack Query 可不一樣！如你所料，TanStack Query 提供了一個名為 `placeholderData` 的強大功能，讓我們能夠解決這個問題。

## 使用 `placeholderData` 實現更好的分頁查詢

考慮以下範例，我們理想情況下會希望遞增查詢的 `pageIndex`（或游標）。如果使用 `useQuery`，**技術上雖然仍能正常運作**，但當為每個頁面或游標建立和銷毀不同的查詢時，UI 會在 `success` 和 `pending` 狀態之間跳動。透過將 `placeholderData` 設為 `(previousData) => previousData` 或使用 TanStack Query 導出的 `keepPreviousData` 函數，我們可以獲得以下優勢：

- **即使查詢鍵已改變，上次成功取得的資料仍可在請求新資料時使用**。
- 當新資料到達時，舊的 `data` 會無縫切換為新資料。
- 可透過 `isPlaceholderData` 得知查詢目前提供的資料類型

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
  <button @click="prevPage">Prev Page</button>
  <button @click="nextPage">Next Page</button>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="isError">An error has occurred: {{ error }}</div>
  <div v-else-if="data">
    <ul>
      <li v-for="item in data" :key="item.id">
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>
```

## 使用 `placeholderData` 延遲無限查詢結果

雖然較不常見，但 `placeholderData` 選項也能完美搭配 `useInfiniteQuery` 鉤子 (hook) 使用，因此當無限查詢鍵隨時間變化時，你可以無縫地讓使用者繼續查看快取的資料。
