---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:22:22.749Z'
id: parallel-queries
title: 平行查詢
---

「平行」查詢是指同時執行多個查詢，以最大化資料獲取的並發性。

## 手動平行查詢

當平行查詢的數量固定不變時，使用平行查詢**無需額外處理**。只需並列使用多個 TanStack Query 的 `useQuery` 和 `useInfiniteQuery` 鉤子即可！

[//]: # 'Example'

```tsx
function App () {
  // 以下查詢會同時執行
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
  ...
}
```

[//]: # 'Example'
[//]: # 'Info'

> 在 suspense 模式中使用 React Query 時，這種平行查詢模式會失效，因為第一個查詢會在內部拋出 promise 並暫停元件，導致其他查詢無法執行。解決方法是使用 `useSuspenseQueries` 鉤子（建議做法），或為每個 `useSuspenseQuery` 實例建立獨立元件來實現平行處理。

[//]: # 'Info'

## 使用 `useQueries` 實現動態平行查詢

[//]: # 'DynamicParallelIntro'

若需要在每次渲染時動態調整查詢數量，手動查詢會違反 hooks 規則。此時應使用 TanStack Query 提供的 `useQueries` 鉤子，它能動態執行任意數量的平行查詢。

[//]: # 'DynamicParallelIntro'

`useQueries` 接收一個包含 **queries 鍵**的**選項物件**，該鍵值為**查詢物件陣列**，並回傳**查詢結果陣列**：

[//]: # 'Example2'

```tsx
function App({ users }) {
  const userQueries = useQueries({
    queries: users.map((user) => {
      return {
        queryKey: ['user', user.id],
        queryFn: () => fetchUserById(user.id),
      }
    }),
  })
}
```

[//]: # 'Example2'
