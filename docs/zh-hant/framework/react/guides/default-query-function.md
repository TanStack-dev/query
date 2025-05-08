---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:24:16.822Z'
id: default-query-function
title: 預設查詢函數
---

如果你基於任何原因，希望能在整個應用程式中共享相同的查詢函式，並僅透過查詢鍵 (query key) 來識別應該獲取什麼資料，你可以透過為 TanStack Query 提供一個 **預設查詢函式 (default query function)** 來實現：

[//]: # '範例'

```tsx
// 定義一個預設查詢函式，它會接收查詢鍵
const defaultQueryFn = async ({ queryKey }) => {
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}

// 現在你只需要傳遞一個鍵即可！
function Posts() {
  const { status, data, error, isFetching } = useQuery({ queryKey: ['/posts'] })

  // ...
}

// 你甚至可以省略 queryFn，直接傳入選項
function Post({ postId }) {
  const { status, data, error, isFetching } = useQuery({
    queryKey: [`/posts/${postId}`],
    enabled: !!postId,
  })

  // ...
}
```

[//]: # '範例'

如果你想覆蓋預設的 queryFn，只需像平常一樣提供你自己的函式即可。
