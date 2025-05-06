---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:04:00.136Z'
id: parallel-queries
title: 并行查询
---
"并行 (Parallel)" 查询是指同时执行多个查询以最大化数据获取的并发性。

## 手动并行查询

当并行查询的数量固定不变时，使用并行查询**无需额外操作**。只需并排使用任意数量的 TanStack Query 的 `useQuery` 和 `useInfiniteQuery` 钩子即可！

```vue
<script setup lang="ts">
// 以下查询将并行执行
const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })
const projectsQuery = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
})
</script>
```

## 使用 `useQueries` 实现动态并行查询

如果需要在每次渲染时动态调整并行查询的数量，手动查询的方式将违反钩子规则。此时，TanStack Query 提供了 `useQueries` 钩子，可动态执行任意数量的并行查询。

`useQueries` 接收一个包含 **queries 键**的**配置对象**，该键的值是由**查询对象组成的数组**，并返回一个**查询结果数组**：

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
