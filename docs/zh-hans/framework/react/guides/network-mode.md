---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:13:05.806Z'
id: network-mode
title: 网络模式
---

TanStack Query 提供了三种不同的网络模式，用于区分在无网络连接时[查询（Queries）](./queries.md)和[变更（Mutations）](./mutations.md)的行为。该模式可以针对每个查询/变更单独设置，也可以通过查询/变更的全局默认值进行配置。

由于 TanStack Query 最常与数据获取库配合使用，其默认网络模式为[在线模式（online）](#network-mode-online)。

## 网络模式：在线模式（online）

在此模式下，只有存在网络连接时才会触发查询和变更。这是默认模式。如果因无网络连接导致查询请求无法发起，该查询将始终保持当前状态（`pending`、`error`、`success`）。此外，系统会额外暴露一个[获取状态（fetchStatus）](./queries.md#fetchstatus)，其可能值为：

- `fetching`：`queryFn` 正在真实执行——请求正在传输中
- `paused`：查询未执行——将保持`paused`状态直至恢复网络连接
- `idle`：查询既未在获取数据也未处于暂停状态

为方便使用，系统会根据此状态派生出`isFetching`和`isPaused`标志。

> 需注意：仅检查`pending`状态可能不足以显示加载动画。如果首次挂载查询时无网络连接，查询可能处于`state: 'pending'`但`fetchStatus: 'paused'`状态。

若查询因网络在线而启动，但在获取过程中断网，TanStack Query 也会暂停重试机制。暂停的查询将在恢复网络连接后继续执行。此行为与`refetchOnReconnect`（该模式默认值为`true`）无关，因为这不是"重新获取"，而是"继续执行"。若查询期间被[取消（cancelled）](./query-cancellation.md)，则不会继续。

## 网络模式：始终模式（always）

在此模式下，TanStack Query 会忽略在线/离线状态始终执行获取。如果您在不需要活跃网络连接的环境中（例如仅从`AsyncStorage`读取数据，或`queryFn`直接返回`Promise.resolve(5)`）使用 TanStack Query，此模式是理想选择。

- 查询永远不会因断网进入`paused`状态
- 重试也不会暂停——查询失败后将直接进入`error`状态
- 此模式下`refetchOnReconnect`默认为`false`，因为网络重连不再意味着需要重新获取过期查询。您仍可手动开启该选项

## 网络模式：离线优先模式（offlineFirst）

此模式是前两种模式的折中方案，TanStack Query 会执行一次`queryFn`，但暂停后续重试。这对于使用[Service Worker拦截请求实现缓存](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)的[离线优先PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)，或通过[Cache-Control头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#the_cache-control_header)实现HTTP缓存的场景非常实用。

在这些场景中，首次获取可能因离线存储/缓存而成功。若缓存未命中，网络请求将发出并失败，此时该模式的行为与`online`查询相同——暂停重试。

## 开发者工具（Devtools）

[TanStack Query开发者工具](../devtools.md)会显示处于`paused`状态的查询——这些查询本应获取数据但因断网而暂停。工具还提供*模拟离线行为*的切换按钮。请注意该按钮不会实际干扰网络连接（您可在浏览器开发者工具中操作），而是会将[OnlineManager](../../../reference/onlineManager.md)设置为离线状态。

## 函数签名（Signature）

- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - 可选参数
  - 默认值：`'online'`
