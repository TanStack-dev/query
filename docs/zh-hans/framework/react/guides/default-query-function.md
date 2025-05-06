---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:13:52.792Z'
id: default-query-function
title: 默认查询函数
---

如果你出于任何原因，希望在整个应用中共享同一个查询函数，仅通过查询键 (query key) 来标识应该获取的数据，可以通过为 TanStack Query 提供一个 **默认查询函数 (default query function)** 来实现：

[//]: # '示例'

```tsx
// 定义一个默认查询函数，它将接收查询键
const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`,
  )
  return data
}

// 通过 defaultOptions 将默认查询函数提供给整个应用
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}

// 现在你只需要传递一个键即可！
function Posts() {
  const { status, data, error, isFetching } = useQuery({ queryKey: ['/posts'] })

  // ...
}

// 你甚至可以省略 queryFn，直接传入选项
function Post({ postId }) {
  const { status, data, error, isFetching } = useQuery({
    queryKey: [`/posts/${postId}`],
    enabled: !!postId,
  })

  // ...
}
```

[//]: # '示例'

如果你想覆盖默认的 queryFn，只需像平常那样提供自己的查询函数即可。
