---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-06T04:56:03.413Z'
id: query-retries
title: 查询重试
---
当 `injectQuery` 查询失败时（查询函数抛出错误），若该查询请求未达到最大连续重试次数（默认为 `3`）或提供了判断是否允许重试的函数，TanStack Query 将自动重试该查询。

您可以在全局级别和单个查询级别配置重试行为：

- 设置 `retry = false` 将禁用重试
- 设置 `retry = 6` 将在显示函数抛出的最终错误前重试失败请求 6 次
- 设置 `retry = true` 将无限重试失败请求
- 设置 `retry = (failureCount, error) => ...` 允许根据失败原因自定义逻辑

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'

// 使特定查询重试指定次数
const result = injectQuery(() => ({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // 将在显示错误前重试失败请求 10 次
}))
```

> 提示：在最后一次重试尝试前，`error` 属性的内容将作为 `failureReason` 响应属性的一部分存在于 `injectQuery` 中。因此在上例中，前 9 次重试尝试（共 10 次）的任何错误内容都将属于 `failureReason` 属性，若所有重试后错误仍存在，最终它们会在最后一次尝试后成为 `error` 的一部分。

## 重试延迟

默认情况下，TanStack Query 的重试不会在请求失败后立即执行。按照标准做法，每次重试尝试会逐渐增加退避延迟时间。

默认 `retryDelay` 设置为每次尝试翻倍（从 `1000` 毫秒开始），但不超过 30 秒：

```ts
// 为所有查询配置
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/angular-query-experimental'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

bootstrapApplication(AppComponent, {
  providers: [provideTanStackQuery(queryClient)],
})
```

虽然不推荐，但您显然可以在插件和单个查询选项中覆盖 `retryDelay` 函数/整数值。如果设置为整数而非函数，延迟时间将始终保持不变：

```ts
const result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // 无论重试多少次，始终等待 1000 毫秒后重试
}))
```
