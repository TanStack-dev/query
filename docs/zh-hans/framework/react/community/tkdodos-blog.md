---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T03:58:18.522Z'
id: tkdodos-blog
title: TkDodo 的博客
---
TanStack Query 的维护者 [TkDodo](https://bsky.app/profile/tkdodo.eu) 撰写了一系列关于该库使用与实践的博客文章。部分文章展示了通用最佳实践，但大多数内容都带有鲜明的个人观点。

## [#1: 实战 React Query](https://tkdodo.eu/blog/practical-react-query)

> 一篇超越官方文档的高级指南，涵盖实用技巧：解析默认配置（`staleTime` 与 `gcTime` 的区别）、保持服务端与客户端状态分离的理念、处理依赖项与创建自定义钩子，并深入剖析 `enabled` 选项的强大之处。[阅读全文...](https://tkdodo.eu/blog/practical-react-query)

## [#2: React Query 数据转换](https://tkdodo.eu/blog/react-query-data-transformations)

> 探索使用 React Query 实现数据转换的多种方案。从在 `queryFn` 中转换到运用 `select` 选项，本文对比了不同方法的优劣。[阅读全文...](https://tkdodo.eu/blog/react-query-data-transformations)

## [#3: React Query 渲染优化](https://tkdodo.eu/blog/react-query-render-optimizations)

> 当组件因 React Query 频繁重渲染时该如何应对？本文详解库内置的优化机制（如 `tracked queries` 避免 `isFetching` 触发渲染），并解析 `structural sharing` 的深层含义。[阅读全文...](https://tkdodo.eu/blog/react-query-render-optimizations)

## [#4: React Query 状态检查](https://tkdodo.eu/blog/status-checks-in-react-query)

> 通常我们会先检查 `isPending` 再判断 `isError`，但有时优先验证 `data` 是否存在更能提升用户体验。本文揭示错误的状态检查顺序如何带来负面影响。[阅读全文...](https://tkdodo.eu/blog/status-checks-in-react-query)

## [#5: 测试 React Query](https://tkdodo.eu/blog/testing-react-query)

> 除了官方文档的测试指南，本文提供额外技巧：关闭 `retries`、静默 `console` 等自定义钩子测试策略，并附赠基于 `mock-service-worker` 的[示例仓库](https://github.com/TkDodo/testing-react-query)（含成功/错误状态测试）。[阅读全文...](https://tkdodo.eu/blog/testing-react-query)

## [#6: React Query 与 TypeScript](https://tkdodo.eu/blog/react-query-and-type-script)

> 深度解析 TypeScript 泛型在 React Query 中的应用：如何利用类型推断避免显式声明 `useQuery`、处理 `unknown` 错误、实现类型收窄等高级技巧。[阅读全文...](https://tkdodo.eu/blog/react-query-and-type-script)

## [#7: 在 React Query 中使用 WebSockets](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

> 逐步指导如何实现实时通知：涵盖事件订阅与全量数据推送两种模式，适配浏览器原生 WebSocket API、Firebase 及 GraphQL 订阅。[阅读全文...](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

## [#8: 高效的 React Query Key 设计](https://tkdodo.eu/blog/effective-react-query-keys)

> 超越简单的字符串键值：当应用复杂度超越待办列表时，如何通过协同定位（co-location）与 Query Key 工厂实现高效管理。[阅读全文...](https://tkdodo.eu/blog/effective-react-query-keys)

## [#8a: 活用 Query 函数上下文](https://tkdodo.eu/blog/leveraging-the-query-function-context)

> 前文补充篇：探讨如何结合 Query 函数上下文与对象键值，为成长型应用提供极致安全性。[阅读全文...](https://tkdodo.eu/blog/leveraging-the-query-function-context)

## [#9: React Query 中的占位与初始数据](https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query)

> 对比占位数据（Placeholder Data）与初始数据（Initial Data）的异同，解析二者在替代加载动画、提升 UX 时的适用场景。[阅读全文...](https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query)

## [#10: 将 React Query 作为状态管理器](https://tkdodo.eu/blog/react-query-as-a-state-manager)

> 揭秘如何让 React Query 成为异步状态的单一数据源：理解其数据同步本质，掌握通过定制 `staleTime` 释放威力的方法。[阅读全文...](https://tkdodo.eu/blog/react-query-as-a-state-manager)

## [#11: React Query 错误处理](https://tkdodo.eu/blog/react-query-error-handling)

> 全面应对异步数据错误：从 error 属性、Error Boundaries 到 onError 回调，为"出错了"的场景构建防御体系。[阅读全文...](https://tkdodo.eu/blog/react-query-error-handling)

## [#12: 精通 React Query 数据变更](https://tkdodo.eu/blog/mastering-mutations-in-react-query)

> 深度解析数据变更（mutations）：区分与查询（queries）的本质差异，比较 `mutate` 与 `mutateAsync`，实现查询与变更的联动。[阅读全文...](https://tkdodo.eu/blog/mastering-mutations-in-react-query)

## [#13: React Query 离线策略](https://tkdodo.eu/blog/offline-react-query)

> 移动端网络不可靠？本文详解 React Query 在离线状态下的多种应对方案。[阅读全文...](https://tkdodo.eu/blog/offline-react-query)

## [#14: React Query 与表单处理](https://tkdodo.eu/blog/react-query-and-forms)

> 模糊服务端与客户端状态的边界：展示两种集成方案，提供表单与 React Query 协同使用的实用技巧。[阅读全文...](https://tkdodo.eu/blog/react-query-and-forms)

## [#15: React Query 常见问题解答](https://tkdodo.eu/blog/react-query-fa-qs)

> 集中解答关于 React Query 的高频疑问。[阅读全文...](https://tkdodo.eu/blog/react-query-fa-qs)

## [#16: React Query 邂逅 React Router](https://tkdodo.eu/blog/react-query-meets-react-router)

> 当 Remix 和 React Router 革新数据加载时机，为何说它们与 React Query 是天作之合？[阅读全文...](https://tkdodo.eu/blog/react-query-meets-react-router)

## [#17: 预填充查询缓存](https://tkdodo.eu/blog/seeding-the-query-cache)

> 多管齐下减少加载动画：从服务端预取、路由预加载到通过 `setQueryData` 注入缓存数据。[阅读全文...](https://tkdodo.eu/blog/seeding-the-query-cache)

## [#18: React Query 内部机制](https://tkdodo.eu/blog/inside-react-query)

> 图解 React Query 架构：从框架无关的 Query Core 到特定框架适配器的通信原理。[阅读全文...](https://tkdodo.eu/blog/inside-react-query)

## [#19: 类型安全的 React Query](https://tkdodo.eu/blog/type-safe-react-query)

> "拥有类型"与"类型安全"存在本质差异。本文演示如何结合 TypeScript 实现最高级别的类型安全。[阅读全文...](https://tkdodo.eu/blog/type-safe-react-query)
