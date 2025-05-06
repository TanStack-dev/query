---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:07:06.536Z'
id: dependent-queries
title: 依赖查询
---

## 依赖查询 (Dependent Query)

依赖查询（或串行查询）需要等待前一个查询完成才能执行。实现这一功能非常简单，只需使用 `enabled` 选项来告知查询何时可以运行：

```ts
// 获取用户信息
userQuery = injectQuery(() => ({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
}))

// 然后获取用户的项目列表
projectsQuery = injectQuery(() => ({
  queryKey: ['projects', this.userQuery.data()?.id],
  queryFn: getProjectsByUser,
  // 该查询只有在用户ID存在时才会执行
  enabled: !!this.userQuery.data()?.id,
}))
```

`projects` 查询会以以下状态开始：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'idle'
```

一旦 `user` 数据可用，`projects` 查询将被 `enabled` 并转为：

```tsx
status: 'pending'
isPending: true
fetchStatus: 'fetching'
```

当项目数据获取完成后，状态会变为：

```tsx
status: 'success'
isPending: false
fetchStatus: 'idle'
```

## injectQueries 依赖查询

动态并行查询 —— `injectQueries` 也可以依赖于前一个查询，实现方式如下：

```ts
// injectQueries 功能正在 Angular Query 中开发
```

**注意**：`injectQueries` 返回的是**查询结果数组**

## 关于性能的说明

依赖查询本质上会形成一种[请求瀑布流 (request waterfall)](./request-waterfalls.md)，这会损害性能。假设两个查询耗时相同，串行执行总是比并行执行多花一倍时间，对于高延迟的客户端尤为不利。如果可能，最好重构后端 API 使两个查询能并行获取，尽管这在实际中不一定可行。

在上面的例子中，与其先获取 `getUserByEmail` 才能调用 `getProjectsByUser`，不如新增一个 `getProjectsByUserEmail` 查询来消除瀑布流。
