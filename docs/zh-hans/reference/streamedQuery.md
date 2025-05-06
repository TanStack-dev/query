---
source-updated-at: '2025-04-02T06:46:03.000Z'
translation-updated-at: '2025-05-06T03:50:56.230Z'
id: streamedQuery
title: streamedQuery
---
`streamedQuery` 是一个辅助函数，用于创建一个从 [AsyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) 流式传输数据的查询函数。数据将是接收到的所有数据块的数组。在接收到第一个数据块之前，查询将处于 `pending` 状态，但之后会转为 `success` 状态。查询将保持 `fetchStatus` 为 `fetching` 直到流结束。

```tsx
const query = queryOptions({
  queryKey: ['data'],
  queryFn: streamedQuery({
    queryFn: fetchDataInChunks,
  }),
})
```

**选项**

- `queryFn: (context: QueryFunctionContext) => Promise<AsyncIterable<TData>>`
  - **必填**
  - 返回一个 Promise 的函数，该 Promise 解析为要流式传输数据的 AsyncIterable。
  - 接收一个 [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext)
- `refetchMode?: 'append' | 'reset'`
  - 可选
  - 设置为 `'reset'` 时，查询会在重新获取数据时清除所有数据并回到 `pending` 状态。
  - 设置为 `'append'` 时，数据会在重新获取时追加。
  - 默认为 `'reset'`
