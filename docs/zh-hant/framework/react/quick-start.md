---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:16:41.564Z'
id: quick-start
title: 快速開始
---

這段程式碼片段簡要說明了 React Query 的 3 個核心概念：

- [查詢 (Queries)](./guides/queries.md)
- [變更 (Mutations)](./guides/mutations.md)
- [查詢失效 (Query Invalidation)](./guides/query-invalidation.md)

[//]: # '範例'

如果您需要完整可運作的範例，請參考我們的 [簡單 StackBlitz 範例](../examples/simple)

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'

// 建立 client
const queryClient = new QueryClient()

function App() {
  return (
    // 將 client 提供給您的 App
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  // 存取 client
  const queryClient = useQueryClient()

  // 查詢
  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  // 變更
  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // 使查詢失效並重新取得資料
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <div>
      <ul>{query.data?.map((todo) => <li key={todo.id}>{todo.title}</li>)}</ul>

      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: 'Do Laundry',
          })
        }}
      >
        新增待辦事項
      </button>
    </div>
  )
}

render(<App />, document.getElementById('root'))
```

[//]: # '範例'

這三個概念構成了 React Query 的大部分核心功能。接下來的文件章節將會詳細說明這些核心概念。
