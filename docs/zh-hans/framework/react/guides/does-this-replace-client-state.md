---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:14:00.417Z'
id: does-this-replace-client-state
title: '这会取代 [Redux, MobX 等] 吗？'
---
首先，我们需要明确几个关键点：

- TanStack Query 是一个**服务端状态 (server-state)** 库，负责管理服务器与客户端之间的异步操作
- Redux、MobX、Zustand 等属于**客户端状态 (client-state)** 库，它们_虽然可以用来存储异步数据，但与 TanStack Query 这类工具相比效率较低_

基于以上认知，简短的答案是：TanStack Query **取代了那些用于管理客户端状态中缓存数据的样板代码和相关连接逻辑，仅需寥寥数行代码即可实现相同功能**。

对于绝大多数应用而言，当把所有异步代码迁移到 TanStack Query 后，剩余的真正**需要全局访问的客户端状态**通常非常少。

> 当然也存在特殊情况：某些应用可能确实拥有大量同步的纯客户端状态（例如可视化设计工具或音乐制作软件），这种情况下您可能仍需要客户端状态管理工具。此时需要注意——**TanStack Query 并不能替代本地/客户端状态管理**。不过您可以毫无障碍地将其与大多数客户端状态管理器配合使用。

## 示例说明

假设我们有以下通过全局状态库管理的"全局"状态：

```tsx
const globalState = {
  projects,
  teams,
  tasks,
  users,
  themeMode,
  sidebarStatus,
}
```

当前全局状态管理器缓存了4类服务端状态：`projects`、`teams`、`tasks` 和 `users`。如果将这些服务端状态迁移到 TanStack Query，剩余的全局状态将简化为：

```tsx
const globalState = {
  themeMode,
  sidebarStatus,
}
```

这意味着通过调用 `useQuery` 和 `useMutation` 等钩子，我们还能移除所有用于管理服务端状态的样板代码，例如：

- 连接器 (Connectors)
- 动作创建器 (Action Creators)
- 中间件 (Middlewares)
- 归约器 (Reducers)
- 加载中/错误/结果状态 (Loading/Error/Result states)
- 上下文 (Contexts)

移除这些内容后，您可能会思考：**"是否还有必要为这点儿全局状态继续使用客户端状态管理器？"**

**这完全取决于您！**

但 TanStack Query 的定位非常明确——它能消除应用中所有异步连接的样板代码，仅需少量代码即可替代。

还在等什么？赶快试试看吧！
