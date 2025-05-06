---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:09:32.012Z'
id: does-this-replace-client-state
title: '这会取代 [Vuex, Pinia] 吗？'
---

首先，让我们明确几个关键点：

- TanStack Query 是一个 **服务端状态 (server-state)** 库，负责管理服务端与客户端之间的异步操作
- Vuex、Pinia、Zustand 等属于 **客户端状态 (client-state)** 库，它们*虽然可以存储异步数据，但与 TanStack Query 这类工具相比效率较低*

基于以上认知，简短的答案是：TanStack Query **会替换那些用于管理客户端状态中缓存数据的样板代码和相关逻辑，仅需寥寥数行代码即可实现相同功能**。

对于绝大多数应用而言，当你将所有异步代码迁移到 TanStack Query 后，真正需要**全局访问的客户端状态**通常所剩无几。

> 当然也存在例外情况，例如某些应用可能确实存在大量同步的纯客户端状态（比如可视化设计工具或音乐制作软件），这时你可能仍需使用客户端状态管理工具。需要注意的是，**TanStack Query 并非用于替代本地/客户端状态管理**。不过你可以毫无障碍地将其与大多数客户端状态管理工具配合使用。

## 示例分析

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

当前全局状态管理器缓存了 4 类服务端状态：`projects`、`teams`、`tasks` 和 `users`。如果将这些服务端状态迁移到 TanStack Query，剩余的全局状态将简化为：

```tsx
const globalState = {
  themeMode,
  sidebarStatus,
}
```

这意味着通过调用 `useQuery` 和 `useMutation` 等钩子函数，我们还可以移除所有用于管理服务端状态的样板代码，例如：

- 连接器 (Connectors)
- 动作创建器 (Action Creators)
- 中间件 (Middlewares)
- 归约器 (Reducers)
- 加载中/错误/结果状态 (Loading/Error/Result states)
- 上下文 (Contexts)

移除这些内容后，你可能会思考：**"为了这么少量的全局状态，是否还有必要继续使用客户端状态管理器？"**

**这完全取决于你的选择！**

但 TanStack Query 的定位非常明确：它能消除应用中异步逻辑的样板代码，仅用少量代码即可实现相同功能。

还在等什么？赶快尝试吧！
