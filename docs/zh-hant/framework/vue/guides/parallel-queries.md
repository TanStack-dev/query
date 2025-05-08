---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:19.576Z'
id: parallel-queries
title: 平行查詢
---

「平行 (Parallel)」查詢指的是同時執行多個查詢，以最大化資料獲取的並發性。

## 手動平行查詢

當平行查詢的數量固定時，使用平行查詢**不需要額外處理**。只需並列使用多個 TanStack Query 的 `useQuery` 和 `useInfiniteQuery` 鉤子即可！

```vue
<script setup lang="ts">
// 以下查詢會同時執行
const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
const projectsQuery = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
})
</script>
```

## 使用 `useQueries` 實現動態平行查詢

如果需要執行的查詢數量會隨渲染變動，則不能使用手動查詢方式（這會違反鉤子規則）。此時 TanStack Query 提供了 `useQueries` 鉤子，可動態並行執行任意數量的查詢。

`useQueries` 接受一個包含 **queries 鍵**的**選項物件**，該鍵值為**查詢物件陣列**，並回傳**查詢結果陣列**：

```js
const users = computed(...)
const queries = computed(() => users.value.map(user => {
    return {
      queryKey: ['user', user.id],
      queryFn: () => fetchUserById(user.id),
    }
  })
);
const userQueries = useQueries({queries: queries})
```
