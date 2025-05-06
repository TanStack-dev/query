---
source-updated-at: '2025-04-02T06:45:29.000Z'
translation-updated-at: '2025-05-06T04:32:50.321Z'
id: overview
title: 概述
---
TanStack Query（前身为 React Query）常被描述为 Web 应用程序中缺失的数据获取库，但更专业地说，它能让 **获取、缓存、同步和更新服务端状态 (server state)** 在你的 Web 应用中变得轻而易举。

## 动机

大多数核心 Web 框架 **并未** 提供一种全面的数据获取或更新方式。因此，开发者最终要么构建封装了严格数据获取理念的元框架 (meta-frameworks)，要么发明自己的数据获取方法。这通常意味着拼凑基于组件的状态和副作用，或使用更通用的状态管理库来存储和提供整个应用中的异步数据。

虽然大多数传统状态管理库非常适合处理客户端状态 (client state)，但它们 **并不擅长处理异步或服务端状态 (server state)**。这是因为 **服务端状态完全不同**。首先，服务端状态：

- 持久化存储在远程位置，你可能无法控制或拥有该位置
- 需要通过异步 API 进行获取和更新
- 意味着共享所有权，可能被其他人更改而无需你知晓
- 如果不加注意，可能会在你的应用中变得“过时 (out of date)”

一旦你理解了应用中服务端状态的本质，**更多挑战会接踵而至**，例如：

- 缓存...（可能是编程中最难的事情）
- 将针对同一数据的多个请求去重 (deduping) 为单个请求
- 在后台更新“过时”数据
- 判断数据何时“过时”
- 尽可能快地反映数据更新
- 分页 (pagination) 和懒加载 (lazy loading) 等性能优化
- 管理服务端状态的内存和垃圾回收 (garbage collection)
- 通过结构共享 (structural sharing) 记忆化 (memoizing) 查询结果

如果你没有被这个清单吓到，那一定意味着你已经解决了所有服务端状态问题，值得嘉奖。然而，如果你像绝大多数人一样，那么你要么尚未解决全部或大部分挑战，而我们才刚刚触及皮毛！

TanStack Query 无疑是管理服务端状态的 **最佳** 库之一。它 **开箱即用、零配置**，并且可以随着应用的增长按需定制。

TanStack Query 能让你战胜并克服 **服务端状态** 的棘手挑战，在数据控制你之前掌控你的应用数据。

从技术角度来说，TanStack Query 可能会：

- 帮助你从应用中移除 **大量** 复杂且难以理解的代码，仅用寥寥几行 TanStack Query 逻辑替代
- 使你的应用更易维护，更容易构建新功能，而无需担心接入新的服务端状态数据源
- 通过让你的应用感觉比以往更快、响应更迅速，直接影响终端用户的体验
- 可能帮助你节省带宽并提升内存性能

[//]: # 'Example'

## 说够了，直接看代码吧！

在下面的示例中，你可以看到 TanStack Query 最基本、最简单的形式，用于获取 TanStack Query GitHub 项目本身的统计信息：

[在 StackBlitz 中打开](https://stackblitz.com/github/TanStack/query/tree/main/examples/react/simple)

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query').then((res) =>
        res.json(),
      ),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

[//]: # 'Example'
[//]: # 'Materials'

## 你说服我了，接下来呢？

- 考虑参加官方的 [TanStack Query 课程](https://query.gg?s=tanstack)（或为整个团队购买！）
- 通过我们极其详尽的 [入门指南](./installation.md) 和 [API 参考](./reference/useQuery.md)，按照自己的节奏学习 TanStack Query

[//]: # 'Materials'
