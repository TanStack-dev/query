---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:14:25.884Z'
id: caching
title: 缓存
---

> 在阅读本指南前，请务必先通读[重要默认配置](./important-defaults.md)

## 基础示例

这个缓存示例演示了以下场景及其生命周期：

- 包含缓存数据与不包含缓存数据的查询实例 (Query Instances)
- 后台重新获取 (Background Refetching)
- 非活跃查询 (Inactive Queries)
- 垃圾回收 (Garbage Collection)

假设我们使用默认的 `gcTime`（**5分钟**）和默认的 `staleTime`（`0`）。

1. 首次挂载 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`：

   - 由于此前没有使用 `['todos']` 查询键 (query key) 发起过其他查询，该查询会显示硬加载状态 (hard loading state) 并通过网络请求获取数据。
   - 当网络请求完成时，返回的数据会缓存在 `['todos']` 键下。
   - 在配置的 `staleTime`（默认为 `0`，即立即）后，数据会被标记为过时 (stale)。

2. 在其他位置挂载第二个 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 实例：

   - 由于缓存中已存在第一个查询的 `['todos']` 键数据，会立即从缓存返回该数据。
   - 新实例会使用其查询函数触发新的网络请求。
     - 注意：无论两个 `fetchTodos` 查询函数是否相同，只要查询键相同，两个查询的 [`status`](../reference/useQuery.md)（包括 `isFetching`、`isPending` 等相关值）都会同步更新。
   - 当请求成功完成时，`['todos']` 键下的缓存数据会更新，两个实例都会接收到新数据。

3. 当两个 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 实例都卸载且不再使用时：

   - 由于该查询没有活跃实例，会使用 `gcTime`（默认为 **5分钟**）设置垃圾回收超时，之后该查询将被删除并回收。

4. 在缓存超时完成前，再次挂载 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`：

   - 查询会立即返回可用的缓存数据，同时在后台执行 `fetchTodos` 函数。成功完成后会用新数据更新缓存。

5. 最后一个 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 实例卸载。

6. 在 **5分钟** 内没有出现新的 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 实例：
   - `['todos']` 键下的缓存数据会被删除并进行垃圾回收。
