---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:14:02.726Z'
id: dependent-queries
title: 依赖查询
---
## useQuery 依赖查询

依赖（或串行）查询需要等待前一个查询完成才能执行。实现这一功能非常简单，只需使用 `enabled` 选项来指定查询何时可以运行：

[//]: # '示例'

```tsx
// 获取用户信息
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// 然后获取该用户的项目列表
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // 只有当 userId 存在时才会执行查询
  enabled: !!userId,
})
```

[//]: # '示例'

`projects` 查询的初始状态为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

当 `user` 数据就绪后，`projects` 查询会被 `enabled` 并转为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

当项目数据获取完成后，状态将变为：

```tsx
status: 'success'
isPending: false
fetchStatus: 'idle'
```

## useQueries 依赖查询

动态并行查询 - `useQueries` 也可以依赖前一个查询，实现方式如下：

[//]: # '示例2'

```tsx
// 获取用户ID列表
const { data: userIds } = useQuery({
  queryKey: ['users'],
  queryFn: getUsersData,
  select: (users) => users.map((user) => user.id),
})

// 然后获取各用户的消息
const usersMessages = useQueries({
  queries: userIds
    ? userIds.map((id) => {
        return {
          queryKey: ['messages', id],
          queryFn: () => getMessagesByUsers(id),
        }
      })
    : [], // 如果users未定义，则返回空数组
})
```

[//]: # '示例2'

**注意** `useQueries` 返回的是**查询结果数组**

## 性能说明

依赖查询本质上构成了[请求瀑布流](./request-waterfalls.md)，会影响性能。假设两个查询耗时相同，串行执行总是比并行执行多花一倍时间，这在客户端高延迟环境下尤其不利。如果可能，最好重构后端API使两个查询能并行获取，尽管这并非总是可行。

在上面的例子中，与其先获取`getUserByEmail`才能执行`getProjectsByUser`，不如新增一个`getProjectsByUserEmail`查询来消除瀑布流。
