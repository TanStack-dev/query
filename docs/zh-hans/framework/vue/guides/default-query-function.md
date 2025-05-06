---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-06T16:13:27.152Z'
id: default-query-function
title: 默认查询函数
---
如果你出于某种原因，希望在整个应用中共享同一个查询函数，仅通过查询键 (query key) 来标识应该获取什么数据，那么可以通过为 TanStack Query 提供一个**默认查询函数 (default query function)** 来实现：

```tsx
// 定义一个默认查询函数，它将接收查询键作为参数
const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`,
  )
  return data
}

// 通过 defaultOptions 将默认查询函数提供给应用
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: { queries: { queryFn: defaultQueryFn } },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)

// 现在你只需要传递一个键即可！
const { status, data, error, isFetching } = useQuery({
  queryKey: [`/posts/${postId}`],
})
```

如果需要覆盖默认的 queryFn，只需像往常一样提供你自己的函数即可。
