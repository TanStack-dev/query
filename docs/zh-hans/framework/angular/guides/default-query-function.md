---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-06T05:07:23.242Z'
id: default-query-function
title: 默认查询函数
---
如果你出于某种原因希望在整个应用中共享同一个查询函数，仅通过查询键 (query key) 来标识应该获取什么数据，那么可以通过为 TanStack Query 提供 **默认查询函数 (default query function)** 来实现：

```ts
// 定义一个默认查询函数，它将接收查询键作为参数
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
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

bootstrapApplication(MyAppComponent, {
  providers: [provideTanStackQuery(queryClient)],
})

export class PostsComponent {
  // 现在你只需要传入一个键即可！
  postsQuery = injectQuery<Array<Post>>(() => ({
    queryKey: ['/posts'],
  }))
  // ...
}

export class PostComponent {
  // 你甚至可以省略 queryFn，直接传入配置项
  postQuery = injectQuery<Post>(() => ({
    enabled: this.postIdSignal() > 0,
    queryKey: [`/posts/${this.postIdSignal()}`],
  }))
  // ...
}
```

如果需要覆盖默认的 queryFn，只需像平常那样提供你自己的查询函数即可。
