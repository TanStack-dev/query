---
source-updated-at: '2025-03-31T09:10:06.000Z'
translation-updated-at: '2025-05-06T04:09:59.909Z'
id: query-cancellation
title: 查询取消
---
TanStack Query 为每个查询函数提供了一个 [`AbortSignal` 实例](https://developer.mozilla.org/docs/Web/API/AbortSignal)。当查询过期或变为非活跃状态时，该 `signal` 将被中止。这意味着所有查询均可取消，您可以根据需要在查询函数内部响应取消操作。最棒的是，您可以在享受自动取消带来的所有优势的同时，继续使用普通的 async/await 语法。

`AbortController` API 在[大多数运行时环境](https://developer.mozilla.org/docs/Web/API/AbortController#browser_compatibility)中可用，但如果您的运行时环境不支持，则需要提供 polyfill。现有[多种 polyfill 可选](https://www.npmjs.com/search?q=abortcontroller%20polyfill)。

## 默认行为

默认情况下，在 Promise 解析前卸载或不再使用的查询_不会_被取消。这意味着 Promise 解析后，结果数据仍会保留在缓存中。这对于已经开始接收查询但尚未完成就卸载组件的情况非常有用。如果您再次挂载组件且查询尚未被垃圾回收，数据将仍然可用。

但如果消费了 `AbortSignal`，Promise 将被取消（例如中止 fetch 请求），因此查询也必须取消。取消查询将导致其状态_回退_到先前的状态。

## 使用 `fetch`

[//]: # '示例'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const todosResponse = await fetch('/todos', {
      // 将 signal 传递给 fetch
      signal,
    })
    const todos = await todosResponse.json()

    const todoDetails = todos.map(async ({ details }) => {
      const response = await fetch(details, {
        // 或传递给多个请求
        signal,
      })
      return response.json()
    })

    return Promise.all(todoDetails)
  },
})
```

[//]: # '示例'

## 使用 `axios` [v0.22.0+](https://github.com/axios/axios/releases/tag/v0.22.0)

[//]: # '示例2'

```tsx
import axios from 'axios'

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) =>
    axios.get('/todos', {
      // 将 signal 传递给 `axios`
      signal,
    }),
})
```

[//]: # '示例2'

### 使用低于 v0.22.0 版本的 `axios`

[//]: # '示例3'

```tsx
import axios from 'axios'

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    // 为该请求创建新的 CancelToken 源
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const promise = axios.get('/todos', {
      // 将 source token 传递给请求
      cancelToken: source.token,
    })

    // 如果 TanStack Query 发出中止信号，则取消请求
    signal?.addEventListener('abort', () => {
      source.cancel('Query was cancelled by TanStack Query')
    })

    return promise
  },
})
```

[//]: # '示例3'

## 使用 `XMLHttpRequest`

[//]: # '示例4'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    return new Promise((resolve, reject) => {
      var oReq = new XMLHttpRequest()
      oReq.addEventListener('load', () => {
        resolve(JSON.parse(oReq.responseText))
      })
      signal?.addEventListener('abort', () => {
        oReq.abort()
        reject()
      })
      oReq.open('GET', '/todos')
      oReq.send()
    })
  },
})
```

[//]: # '示例4'

## 使用 `graphql-request`

可以在客户端的 `request` 方法中设置 `AbortSignal`。

[//]: # '示例5'

```tsx
const client = new GraphQLClient(endpoint)

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    client.request({ document: query, signal })
  },
})
```

[//]: # '示例5'

## 使用低于 v4.0.0 版本的 `graphql-request`

可以在 `GraphQLClient` 构造函数中设置 `AbortSignal`。

[//]: # '示例6'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    const client = new GraphQLClient(endpoint, {
      signal,
    })
    return client.request(query, variables)
  },
})
```

[//]: # '示例6'

## 手动取消

您可能需要手动取消查询。例如，如果请求耗时过长，可以允许用户点击取消按钮停止请求。只需调用 `queryClient.cancelQueries({ queryKey })` 即可取消查询并回退到之前的状态。如果您消费了传递给查询函数的 `signal`，TanStack Query 还会额外取消 Promise。

[//]: # '示例7'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const resp = await fetch('/todos', { signal })
    return resp.json()
  },
})

const queryClient = useQueryClient()

return (
  <button
    onClick={(e) => {
      e.preventDefault()
      queryClient.cancelQueries({ queryKey: ['todos'] })
    }}
  >
    取消
  </button>
)
```

[//]: # '示例7'

## 限制

当使用 `Suspense` 钩子时，取消功能不可用：`useSuspenseQuery`、`useSuspenseQueries` 和 `useSuspenseInfiniteQuery`。
