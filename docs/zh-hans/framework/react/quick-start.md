---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-03T21:51:49.019Z'
id: quick-start
title: 快速开始
---

以下代码片段简要展示了 React Query 的 3 个核心概念：

- [查询 (Queries)](./guides/queries.md)
- [变更 (Mutations)](./guides/mutations.md)
- [查询失效 (Query Invalidation)](./guides/query-invalidation.md)

[//]: # '示例'

如需查看完整功能示例，请参考我们的 [简单 StackBlitz 示例](../examples/simple)

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'

// 创建客户端
const queryClient = new QueryClient()

function App() {
  return (
    // 将客户端提供给应用
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  // 访问客户端
  const queryClient = useQueryClient()

  // 查询
  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  // 变更
  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // 使缓存失效并重新获取
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
        添加待办
      </button>
    </div>
  )
}

render(<App />, document.getElementById('root'))
```

[//]: # '示例'

这三个概念构成了 React Query 的大部分核心功能。文档的后续章节将详细讲解每个核心概念。
