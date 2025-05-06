---
source-updated-at: '2024-12-16T15:14:41.000Z'
translation-updated-at: '2025-05-06T04:46:07.089Z'
id: broadcastQueryClient
title: broadcastQueryClient (实验性)
---

> 重要提示：该工具目前处于实验阶段。这意味着在次要版本和补丁版本中都可能出现破坏性变更。使用时需自行承担风险。如果您选择在生产环境中依赖此实验阶段的功能，请将版本锁定到具体的补丁版本以避免意外中断。

`broadcastQueryClient` 是一个用于在同源浏览器标签页/窗口之间广播和同步 queryClient 状态的工具。

## 安装

该工具作为独立包提供，可通过 `'@tanstack/query-broadcast-client-experimental'` 导入。

## 使用方式

导入 `broadcastQueryClient` 函数，传入您的 `QueryClient` 实例，并可选地设置 `broadcastChannel`。

```tsx
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

const queryClient = new QueryClient()

broadcastQueryClient({
  queryClient,
  broadcastChannel: 'my-app',
})
```

## API

### `broadcastQueryClient`

向该函数传入一个 `QueryClient` 实例，并可选择性地传入 `broadcastChannel`。

```tsx
broadcastQueryClient({ queryClient, broadcastChannel })
```

### `Options`

选项对象：

```tsx
interface BroadcastQueryClientOptions {
  /** 需要同步的 QueryClient */
  queryClient: QueryClient
  /** 用于在标签页和窗口之间通信的唯一频道名称 */
  broadcastChannel?: string
  /** BroadcastChannel API 的选项 */
  options?: BroadcastChannelOptions
}
```

默认选项为：

```tsx
{
  broadcastChannel = 'tanstack-query',
}
```
