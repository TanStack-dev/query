---
source-updated-at: '2024-04-11T09:16:39.000Z'
translation-updated-at: '2025-05-06T04:41:50.065Z'
id: QueryErrorResetBoundary
title: QueryErrorResetBoundary
---

## 动机

大多数核心 Web 框架**并未**提供一种全面的数据获取或更新方案。因此，开发者最终要么构建封装了严格数据获取规范的元框架，要么自行发明数据获取方式。这通常意味着拼凑基于组件的状态和副作用，或是使用更通用的状态管理库来存储并提供应用中的异步数据。

虽然大多数传统状态管理库非常适合处理客户端状态，但它们**在处理异步或服务端状态时表现欠佳**。这是因为**服务端状态完全不同**。首先，服务端状态：

- 持久化存储在您可能无法控制或拥有的远程位置
- 需要通过异步 API 进行获取和更新
- 意味着共享所有权，可能被他人更改而您不知情
- 如果不加注意，可能在应用中变得"过时"

一旦理解了应用中服务端状态的本质，**更多挑战将接踵而至**，例如：

- 缓存...（可能是编程中最难实现的部分）
- 将针对相同数据的多个请求去重为单个请求
- 在后台更新"过时"数据
- 判断数据何时"过时"
- 尽可能快地反映数据更新
- 分页和懒加载等性能优化
- 管理服务端状态的内存和垃圾回收
- 通过结构共享记忆化查询结果

如果您没有被这个清单吓到，那一定意味着您已经解决了所有服务端状态问题并值得嘉奖。然而，如果您像绝大多数人一样，那么您要么尚未解决全部或大部分挑战，而我们才刚刚触及表面！

TanStack Query 无疑是管理服务端状态的最佳库之一。它开箱即用，零配置就能表现出色，并且可以随着应用增长按需定制。

TanStack Query 让您能够战胜和克服服务端状态的各种棘手挑战，在应用数据控制您之前掌控它们。

从技术角度而言，TanStack Query 很可能：

- 帮助您从应用中移除**大量**复杂且难以理解的代码，仅用几行 TanStack Query 逻辑替代
- 提高应用的可维护性，更轻松地构建新功能而无需担心连接新的服务端状态数据源
- 通过使应用感觉比以往更快、响应更迅速，直接影响最终用户体验
- 可能帮助节省带宽并提升内存性能

当在查询中使用 **suspense** 或 **throwOnError** 时，您需要一种方式让查询知道在发生错误后重新渲染时您想重试。通过 `QueryErrorResetBoundary` 组件，您可以重置组件边界内的任何查询错误。

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            There was an error!
            <Button onClick={() => resetErrorBoundary()}>Try again</Button>
          </div>
        )}
      >
        <Page />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```
