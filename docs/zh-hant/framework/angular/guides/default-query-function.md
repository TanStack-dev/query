---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-08T20:25:52.045Z'
id: default-query-function
title: 預設查詢函數
---

如果你基於任何原因，希望能在整個應用程式中共享同一個查詢函式，並僅透過查詢鍵 (query key) 來識別應該獲取的資料，你可以透過為 TanStack Query 提供一個 **預設查詢函式 (default query function)** 來實現：

```ts
// 定義一個預設查詢函式，它會接收查詢鍵
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`,
  )
  return data
}

// 透過 defaultOptions 將預設查詢函式提供給你的應用程式
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
  // 現在你只需要傳入一個鍵！
  postsQuery = injectQuery<Array<Post>>(() => ({
    queryKey: ['/posts'],
  }))
  // ...
}

export class PostComponent {
  // 你甚至可以省略 queryFn，直接傳入選項
  postQuery = injectQuery<Post>(() => ({
    enabled: this.postIdSignal() > 0,
    queryKey: [`/posts/${this.postIdSignal()}`],
  }))
  // ...
}
```

如果你想要覆寫預設的 queryFn，只需像平常一樣提供你自己的函式即可。
