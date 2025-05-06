---
source-updated-at: '2024-04-08T07:32:55.000Z'
translation-updated-at: '2025-05-06T16:13:12.811Z'
id: dependent-queries
title: 依赖查询
---
## 依赖查询 (Dependent Query)

依赖查询（或称串行查询）需要等待前一个查询完成后才能执行。实现这一功能非常简单，只需使用 `enabled` 选项来指定查询何时可以运行：

```js
// 获取用户信息
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: () => getUserByEmail(email.value),
})

const userId = computed(() => user.value?.id)
const enabled = computed(() => !!user.value?.id)

// 然后获取该用户的项目
const { isIdle, data: projects } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => getProjectsByUser(userId.value),
  enabled, // 只有当 `enabled == true` 时才会执行查询
})
```

`projects` 查询初始状态为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

当 `user` 数据可用时，`projects` 查询会被 `enabled` 并转为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

获取到项目数据后，状态将变为：

```tsx
status: 'success'
isPending: false
fetchStatus: 'idle'
```

## 批量依赖查询 (useQueries Dependent Query)

动态并行查询 `useQueries` 也可以依赖前一个查询，实现方式如下：

```tsx
// 获取用户ID列表
const { data: userIds } = useQuery({
  queryKey: ['users'],
  queryFn: getUsersData,
  select: (users) => users.map((user) => user.id),
})

const queries = computed(() => {
  return userIds.value.length
    ? userIds.value.map((id) => {
        return {
          queryKey: ['messages', id],
          queryFn: () => getMessagesByUsers(id),
        }
      })
    : []
})

// 然后获取用户消息
const usersMessages = useQueries({
  queries, // 如果用户数据未定义，将返回空数组
})
```

**注意**：`useQueries` 返回的是**查询结果数组**

## 性能注意事项

依赖查询本质上会形成[请求瀑布流 (request waterfall)](./request-waterfalls.md)，从而影响性能。假设两个查询耗时相同，串行执行总是比并行执行多花一倍时间，这在客户端高延迟环境下尤为不利。如果可能，最好重构后端 API 使两个查询能够并行获取，尽管实际中可能难以实现。

在上面的示例中，与其先获取 `getUserByEmail` 才能调用 `getProjectsByUser`，不如新增一个 `getProjectsByUserEmail` 查询来消除瀑布流。
