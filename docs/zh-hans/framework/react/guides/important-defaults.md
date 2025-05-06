---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:12:55.170Z'
id: important-defaults
title: 重要默认设置
---

开箱即用，TanStack Query 采用了**激进但合理**的默认配置。**这些默认设置有时会让新用户措手不及，如果用户不了解它们，可能会增加学习或调试的难度。**在继续学习和使用 TanStack Query 时，请牢记以下要点：

- 通过 `useQuery` 或 `useInfiniteQuery` 创建的查询实例默认**将缓存数据视为过时数据**。

> 若要修改此行为，可通过全局配置或单查询配置使用 `staleTime` 选项。设置较长的 `staleTime` 意味着查询不会频繁重新获取数据。

- 当满足以下条件时，过时查询会在后台自动重新获取数据：
  - 新的查询实例挂载
  - 窗口重新获得焦点
  - 网络重新连接
  - 查询配置了可选的 refetch 间隔时间

> 可通过 `refetchOnMount`、`refetchOnWindowFocus`、`refetchOnReconnect` 和 `refetchInterval` 等选项调整此功能。

- 当 `useQuery`、`useInfiniteQuery` 或查询观察者不再有活跃实例时，对应的查询结果会被标记为"非活跃"状态，并保留在缓存中供后续使用。
- 默认情况下，"非活跃"查询会在 **5 分钟后**被垃圾回收。

  > 可通过修改默认的 `gcTime`（当前为 `1000 * 60 * 5` 毫秒）来调整此设置。

- 失败的查询会**静默重试 3 次**，采用指数退避延迟策略，之后才会捕获错误并显示到用户界面。

  > 可通过修改默认的 `retry`（重试次数）和 `retryDelay`（退避延迟函数）选项来调整此行为。

- 默认情况下，查询结果会进行**结构共享比较以检测数据是否实际变化**。如果数据未变化，则**保持数据引用不变**，从而更好地配合 useMemo 和 useCallback 实现值稳定性。如果这个概念听起来陌生，无需担心！99.9% 的情况下您不需要禁用此功能，它能零成本提升应用性能。

  > 结构共享仅适用于 JSON 兼容值，其他值类型始终会被视为已变化。例如，若因响应数据过大导致性能问题，可通过 `config.structuralSharing` 标志禁用此功能。若查询响应包含非 JSON 兼容值但仍需检测数据变化，可提供自定义函数作为 `config.structuralSharing`，根据新旧响应计算值并按需保持引用。

[//]: # 'Materials'

## 扩展阅读

查看以下社区资源文章，深入了解默认配置的原理：

- [React Query 实战指南](../community/tkdodos-blog.md#1-practical-react-query)
- [作为状态管理器的 React Query](../community/tkdodos-blog.md#10-react-query-as-a-state-manager)

[//]: # 'Materials'
