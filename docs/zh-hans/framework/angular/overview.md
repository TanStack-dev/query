---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-06T04:51:31.172Z'
id: overview
title: 概述
---

> 重要提示：该库目前处于实验阶段。这意味着在次要版本和补丁版本中可能会出现破坏性变更。升级时请谨慎操作。如果您在生产环境中使用此实验阶段的库，请将版本锁定到具体的补丁版本以避免意外的破坏性变更。

`@tanstack/angular-query-experimental` 包为通过 Angular 使用 TanStack Query 提供了一流的 API。

## 欢迎反馈！

我们正在努力为 Angular 上的 TanStack Query 提供稳定的 API。如果您有任何反馈意见，请联系我们的 [TanStack Discord](https://tlinz.com/discord) 服务器或在 GitHub 上[参与此讨论](https://github.com/TanStack/query/discussions/6293)。

## 支持的 Angular 版本

TanStack Query 兼容 Angular v16 及以上版本。

TanStack Query（前身为 React Query）常被描述为 Web 应用程序中缺失的数据获取库，但从技术角度而言，它能让 **获取、缓存、同步和更新服务端状态** 在您的 Web 应用中变得轻而易举。

## 动机

大多数核心 Web 框架 **并未** 提供一种全面的数据获取或更新方式。因此，开发者最终要么构建封装了严格数据获取理念的元框架，要么发明自己的数据获取方法。这通常意味着拼凑基于组件的状态和副作用，或者使用更通用的状态管理库来存储和提供整个应用中的异步数据。

虽然大多数传统状态管理库在处理客户端状态时表现优异，但 **在处理异步或服务端状态时并不理想**。这是因为 **服务端状态完全不同**。首先，服务端状态：

- 持久化存储在您可能无法控制或拥有的远程位置
- 需要异步 API 进行获取和更新
- 意味着共享所有权，可能被他人更改而您不知情
- 如果不小心处理，可能在您的应用中变得“过时”

一旦您理解了应用中服务端状态的本质，**更多挑战会随之而来**，例如：

- 缓存...（可能是编程中最难的事情）
- 将针对相同数据的多个请求去重为单个请求
- 在后台更新“过时”数据
- 知道数据何时“过时”
- 尽可能快地反映数据更新
- 分页和懒加载数据等性能优化
- 管理服务端状态的内存和垃圾回收
- 通过结构共享记忆查询结果

如果这个列表没有让您感到压力，那一定意味着您已经解决了所有服务端状态问题并值得嘉奖。然而，如果您和大多数人一样，可能尚未应对全部或大部分挑战，而我们才刚刚触及表面！

TanStack Query 无疑是管理服务端状态的**最佳**库之一。它**开箱即用、零配置**，并且可以随着应用的增长按需定制。

TanStack Query 让您能够战胜和克服**服务端状态**的棘手挑战，在数据开始控制您之前掌控应用数据。

从技术角度来看，TanStack Query 可能会：

- 帮助您从应用中移除**大量**复杂且难以理解的代码，仅用寥寥几行 TanStack Query 逻辑替代
- 提高应用的可维护性，轻松构建新功能而无需担心连接新的服务端状态数据源
- 通过使应用感觉比以往更快、响应更迅速，直接影响最终用户体验
- 可能帮助您节省带宽并提升内存性能

[//]: # '示例'

## 说够了，直接看代码吧！

在下面的示例中，您可以看到 TanStack Query 最基本和简单的形式，用于获取 TanStack Query GitHub 项目本身的统计信息：

[在 StackBlitz 中打开](https://stackblitz.com/github/TanStack/query/tree/main/examples/angular/simple)

```angular-ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { lastValueFrom } from 'rxjs'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'simple-example',
  standalone: true,
  template: `
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error().message }}
    }
    @if (query.data(); as data) {
      <h1>{{ data.name }}</h1>
      <p>{{ data.description }}</p>
      <strong>👀 {{ data.subscribers_count }}</strong>
      <strong>✨ {{ data.stargazers_count }}</strong>
      <strong>🍴 {{ data.forks_count }}</strong>
    }
  `
})
export class SimpleExampleComponent {
  http = inject(HttpClient)

  query = injectQuery(() => ({
    queryKey: ['repoData'],
    queryFn: () =>
      lastValueFrom(
        this.http.get<Response>('https://api.github.com/repos/tanstack/query'),
      ),
  }))
}

interface Response {
  name: string
  description: string
  subscribers_count: number
  stargazers_count: number
  forks_count: number
}
```

## 您说服了我，接下来该怎么做？

- 按照自己的节奏学习 TanStack Query，参考我们详尽的[入门指南](../installation)和[API 参考](../reference/functions/injectquery)
