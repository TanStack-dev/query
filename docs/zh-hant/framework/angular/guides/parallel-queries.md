---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:25:18.361Z'
id: parallel-queries
title: 平行查詢
---

「平行 (Parallel)」查詢是指同時執行多個查詢，以最大化資料獲取的並發性。

## 手動平行查詢

當平行查詢的數量固定時，使用平行查詢**無需額外處理**。只需並列使用多個 TanStack Query 的 `injectQuery` 和 `injectInfiniteQuery` 函式即可！

```ts
export class AppComponent {
  // 以下查詢將會平行執行
  usersQuery = injectQuery(() => ({ queryKey: ['users'], queryFn: fetchUsers }))
  teamsQuery = injectQuery(() => ({ queryKey: ['teams'], queryFn: fetchTeams }))
  projectsQuery = injectQuery(() => ({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  }))
}
```

## 使用 `injectQueries` 動態平行查詢

TanStack Query 提供 `injectQueries` 函式，可讓你動態執行任意數量的平行查詢。

`injectQueries` 接受一個**選項物件**，其中包含一個 **queries 鍵**，其值為**查詢物件的陣列**。它會回傳一個**查詢結果的陣列**：

```ts
export class AppComponent {
  users = signal<Array<User>>([])

  // 請注意 injectQueries 仍在開發中，此程式碼目前無法運作
  userQueries = injectQueries(() => ({
    queries: users().map((user) => {
      return {
        queryKey: ['user', user.id],
        queryFn: () => fetchUserById(user.id),
      }
    }),
  }))
}
```
