---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-06T05:07:51.213Z'
id: caching
title: 缓存
---
> 请先完整阅读 [重要默认配置](../important-defaults) 再阅读本指南

## 基础示例

这个缓存示例展示了以下场景及其生命周期：

- 包含缓存数据与不包含缓存数据的查询实例
- 后台重新获取
- 非活跃查询
- 垃圾回收

假设我们使用默认的 `gcTime`（5 分钟）和默认的 `staleTime`（0）。

- 初始化一个新的 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos }))` 实例：
  - 由于之前没有使用 `['todos']` 查询键发起过其他查询，该查询会显示硬加载状态并发起网络请求获取数据。
  - 当网络请求完成时，返回的数据会被缓存在 `['todos']` 键下。
  - 数据会在配置的 `staleTime`（默认为 `0`，即立即）后被标记为过时。
  
- 在其他地方初始化第二个 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 实例：
  - 由于缓存中已存在第一个查询的 `['todos']` 键数据，该数据会立即从缓存中返回。
  - 新实例会使用其查询函数触发一个新的网络请求。
    - 注意：无论两个 `fetchTodos` 查询函数是否相同，两个查询的 [`status`](../../reference/injectQuery)（包括 `isFetching`、`isPending` 等相关值）都会更新，因为它们共享相同的查询键。
  - 当请求成功完成时，`['todos']` 键下的缓存数据会更新为新数据，两个实例都会同步到新数据。

- 两个 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 实例被销毁且不再使用：
  - 由于该查询没有活跃实例，系统会基于 `gcTime` 设置垃圾回收超时（默认为 5 分钟）来删除并回收该查询。

- 在缓存超时完成前，另一个 `injectQuery(() => ({ queryKey: ['todos'], queyFn: fetchTodos })` 实例挂载：
  - 查询会立即返回可用的缓存数据，同时 `fetchTodos` 函数在后台运行。当成功完成后，会用新数据更新缓存。

- 最后一个 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 实例被销毁：
  - 在 5 分钟内没有再出现 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 实例。
  - `['todos']` 键下的缓存数据被删除并完成垃圾回收。
