---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T04:59:05.811Z'
id: parallel-queries
title: 并行查询
---
"并行 (Parallel)" 查询是指同时执行多个查询，以最大化数据获取的并发性。

## 手动并行查询

当并行查询的数量固定时，使用并行查询**无需额外操作**。只需并排使用任意数量的 TanStack Query 提供的 `injectQuery` 和 `injectInfiniteQuery` 函数即可！

```ts
export class AppComponent {
  // 以下查询将并行执行
  usersQuery = injectQuery(() => ({ queryKey: ['users'], queryFn: fetchUsers }))
  teamsQuery = injectQuery(() => ({ queryKey: ['teams'], queryFn: fetchTeams }))
  projectsQuery = injectQuery(() => ({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  }))
}
```

## 使用 `injectQueries` 实现动态并行查询

TanStack Query 提供了 `injectQueries` 方法，可用于动态执行任意数量的并行查询。

`injectQueries` 接收一个包含 **queries 键**的**配置对象**，该键的值是**查询对象数组**。该方法会返回一个**查询结果数组**：

```ts
export class AppComponent {
  users = signal<Array<User>>([])

  // 请注意 injectQueries 正在开发中，以下代码暂不可用
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
