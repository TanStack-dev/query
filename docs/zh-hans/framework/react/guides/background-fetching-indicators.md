---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:14:14.853Z'
id: background-fetching-indicators
title: 后台获取指示器
---
# 后台获取指示器

查询的 `status === 'pending'` 状态足以显示查询的初始硬加载状态，但有时您可能希望额外显示一个指示器，表明查询正在后台重新获取。为此，查询还提供了一个 `isFetching` 布尔值，您可以用它来显示查询正处于获取状态，而无论 `status` 变量的状态如何：

[//]: # 'Example'

```tsx
function Todos() {
  const {
    status,
    data: todos,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return status === 'pending' ? (
    <span>Loading...</span>
  ) : status === 'error' ? (
    <span>Error: {error.message}</span>
  ) : (
    <>
      {isFetching ? <div>Refreshing...</div> : null}

      <div>
        {todos.map((todo) => (
          <Todo todo={todo} />
        ))}
      </div>
    </>
  )
}
```

[//]: # 'Example'

## 显示全局后台获取加载状态

除了单个查询的加载状态外，如果您希望在**任何**查询获取时（包括在后台）显示全局加载指示器，可以使用 `useIsFetching` 钩子：

[//]: # 'Example2'

```tsx
import { useIsFetching } from '@tanstack/react-query'

function GlobalLoadingIndicator() {
  const isFetching = useIsFetching()

  return isFetching ? (
    <div>Queries are fetching in the background...</div>
  ) : null
}
```

[//]: # 'Example2'
