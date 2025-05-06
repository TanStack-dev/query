---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:09:37.356Z'
id: parallel-queries
title: 并行查询
---
"并行 (Parallel)" 查询是指同时执行多个查询，以最大化数据获取的并发性。

## 手动并行查询

当并行查询的数量固定不变时，使用并行查询**无需额外操作**。只需并列使用任意数量的 TanStack Query 提供的 `useQuery` 和 `useInfiniteQuery` 钩子即可！

[//]: # '示例'

```tsx
function App () {
  // 以下查询将并行执行
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
  ...
}
```

[//]: # '示例'
[//]: # '提示'

> 在 suspense 模式下使用 React Query 时，这种并行模式会失效，因为第一个查询会在内部抛出 promise 并挂起组件，导致其他查询无法执行。解决方案是使用 `useSuspenseQueries` 钩子（推荐方式），或通过为每个 `useSuspenseQuery` 实例创建独立组件来实现并行控制。

[//]: # '提示'

## 使用 `useQueries` 实现动态并行查询

[//]: # '动态并行介绍'

如果需要在每次渲染时动态调整查询数量，手动查询的方式会违反钩子规则。此时应使用 TanStack Query 提供的 `useQueries` 钩子，它可以动态执行任意数量的并行查询。

[//]: # '动态并行介绍'

`useQueries` 接收一个包含 **queries 键**的**配置对象**，其值为**查询对象数组**。该钩子返回一个**查询结果数组**：

[//]: # '示例2'

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

[//]: # '示例2'
