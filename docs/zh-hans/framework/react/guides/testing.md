---
source-updated-at: '2025-03-24T10:00:44.000Z'
translation-updated-at: '2025-05-06T04:03:34.392Z'
id: testing
title: 测试
---
React Query 通过钩子（hooks）机制工作——无论是我们提供的钩子还是围绕它们封装的自定义钩子。

在 React 17 或更早版本中，可以使用 [React Hooks Testing Library](https://react-hooks-testing-library.com/) 库为这些自定义钩子编写单元测试。

通过以下命令安装：

```sh
npm install @testing-library/react-hooks react-test-renderer --save-dev
```

（`react-test-renderer` 库是 `@testing-library/react-hooks` 的 peer 依赖项，其版本需与当前使用的 React 版本对应。）

*注意*：在 React 18 或更高版本中，`renderHook` 可直接通过 `@testing-library/react` 包使用，不再需要 `@testing-library/react-hooks`。

## 第一个测试

安装完成后，可以编写一个简单测试。假设有以下自定义钩子：

```tsx
export function useCustomHook() {
  return useQuery({ queryKey: ['customHook'], queryFn: () => 'Hello' })
}
```

对应的测试代码如下：

```tsx
import { renderHook, waitFor } from '@testing-library/react'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const { result } = renderHook(() => useCustomHook(), { wrapper })

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data).toEqual('Hello')
```

注意我们提供了一个自定义包装器（wrapper），用于构建 `QueryClient` 和 `QueryClientProvider`。这确保了测试与其他测试完全隔离。

虽然可以全局只编写一次包装器，但需确保每次测试前清空 `QueryClient`，且测试不能并行运行，否则会相互影响结果。

## 关闭重试机制

库默认会进行三次指数退避重试，因此测试错误查询时可能导致超时。最简单的方式是通过 `QueryClientProvider` 全局关闭重试。扩展上述示例：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ 关闭重试
      retry: false,
    },
  },
})
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
```

这会设置组件树中所有查询的默认行为为“不重试”。需注意，仅当实际 `useQuery` 未显式设置重试次数时此配置生效。若某查询明确要求重试5次，该设置仍会优先于全局默认值。

## 在 Jest 中设置 gcTime 为 Infinity

如果使用 Jest，可将 `gcTime` 设为 `Infinity` 以避免出现“Jest 在测试完成后未及时退出”的错误。这是服务端的默认行为，仅当显式设置 `gcTime` 时才需要调整。

## 测试网络请求

React Query 的主要用途是缓存网络请求，因此验证代码是否发起正确的网络请求至关重要。

测试方法有多种，本例使用 [nock](https://www.npmjs.com/package/nock)。假设有以下自定义钩子：

```tsx
function useFetchData() {
  return useQuery({
    queryKey: ['fetchData'],
    queryFn: () => request('/api/data'),
  })
}
```

测试代码如下：

```tsx
const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const expectation = nock('http://example.com').get('/api/data').reply(200, {
  answer: 42,
})

const { result } = renderHook(() => useFetchData(), { wrapper })

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data).toEqual({ answer: 42 })
```

这里使用 `waitFor` 等待查询状态变为成功，确保钩子已完成处理并返回正确数据。*注意*：在 React 18 中，`waitFor` 的语义有所变化。

## 测试加载更多/无限滚动

首先模拟 API 响应：

```tsx
function generateMockedResponse(page) {
  return {
    page: page,
    items: [...]
  }
}
```

然后通过 `nock` 配置基于页码区分响应，利用 `uri` 实现动态匹配（如 `"/?page=1"` 或 `"/?page=2"`）：

```tsx
const expectation = nock('http://example.com')
  .persist()
  .query(true)
  .get('/api/data')
  .reply(200, (uri) => {
    const url = new URL(`http://example.com${uri}`)
    const { page } = Object.fromEntries(url.searchParams)
    return generateMockedResponse(page)
  })
```

（注意 `.persist()`，因为会多次调用同一接口）

测试时关键点是等待数据断言通过：

```tsx
const { result } = renderHook(() => useInfiniteQueryCustomHook(), {
  wrapper,
})

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data.pages).toStrictEqual(generateMockedResponse(1))

result.current.fetchNextPage()

await waitFor(() =>
  expect(result.current.data.pages).toStrictEqual([
    ...generateMockedResponse(1),
    ...generateMockedResponse(2),
  ]),
)

expectation.done()
```

*注意*：React 18 中 `waitFor` 的语义变化同上文所述。

## 延伸阅读

更多技巧及使用 `mock-service-worker` 的替代方案，可参考社区资源中的 [Testing React Query](../community/tkdodos-blog.md#5-testing-react-query)。
