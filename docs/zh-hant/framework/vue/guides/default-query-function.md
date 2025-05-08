---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:49.955Z'
id: default-query-function
title: 預設查詢函數
---

如果你基於任何原因，希望能在整個應用程式中共享同一個查詢函式，並僅透過查詢鍵 (query key) 來識別應該獲取的資料，你可以透過為 TanStack Query 提供一個 **預設查詢函式 (default query function)** 來實現：

```tsx
// 定義一個預設查詢函式，它會接收查詢鍵
const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`,
  )
  return data
}

// 透過 defaultOptions 將預設查詢函式提供給你的應用程式
const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: { queries: { queryFn: defaultQueryFn } },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)

// 現在你只需要傳入一個鍵！
const { status, data, error, isFetching } = useQuery({
  queryKey: [`/posts/${postId}`],
})
```

如果你想覆寫預設的 queryFn，只需像平常一樣提供你自己的函式即可。
