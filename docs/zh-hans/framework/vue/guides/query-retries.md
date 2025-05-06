---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T05:28:59.848Z'
id: query-retries
title: 查询重试
---

当 `useQuery` 查询失败（查询函数抛出错误）时，如果该查询的请求未达到最大连续重试次数（默认为 `3`）或提供了判断是否允许重试的函数，TanStack Query 会自动重试该查询。

您可以在全局级别和单个查询级别配置重试行为：

- 设置 `retry = false` 将禁用重试。
- 设置 `retry = 6` 会在显示函数抛出的最终错误前重试失败请求 6 次。
- 设置 `retry = true` 会无限重试失败请求。
- 设置 `retry = (failureCount, error) => ...` 允许根据请求失败原因自定义逻辑。

> 在服务端，重试默认值为 `0` 以确保服务端渲染尽可能快速。

```tsx
import { useQuery } from '@tanstack/vue-query'

// 让特定查询重试指定次数
const result = useQuery({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // 将在显示错误前重试失败请求 10 次
})
```

> 提示：在最后一次重试尝试前，`error` 属性的内容将作为 `failureReason` 响应属性存在于 `useQuery` 中。因此在上例中，前 9 次重试尝试（共 10 次）的任何错误内容都将属于 `failureReason` 属性，最终如果所有重试后错误仍存在，它们将在最后一次尝试后成为 `error` 的一部分。

## 重试延迟

默认情况下，TanStack Query 不会在请求失败后立即重试。按照标准做法，每次重试尝试会逐渐增加退避延迟。

默认 `retryDelay` 设置为每次尝试翻倍（从 `1000` 毫秒开始），但不超过 30 秒：

```ts
import { VueQueryPlugin } from '@tanstack/vue-query'

const vueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

虽然不推荐，但您显然可以在插件和单个查询选项中覆盖 `retryDelay` 函数/整数值。如果设置为整数而非函数，延迟时间将始终保持不变：

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // 无论重试多少次，总是等待 1000 毫秒进行重试
})
```
