---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:24:36.640Z'
id: background-fetching-indicators
title: 背景獲取指示器
---

# 背景擷取指示器 (Background Fetching Indicators)

查詢的 `status === 'pending'` 狀態足以顯示查詢的初始硬載入狀態，但有時您可能希望顯示一個額外的指示器，表示查詢正在背景中重新擷取。為此，查詢還提供了一個 `isFetching` 布林值，您可以用它來顯示查詢處於擷取狀態，無論 `status` 變數的狀態如何：

[//]: # '範例'

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
    <span>載入中...</span>
  ) : status === 'error' ? (
    <span>錯誤: {error.message}</span>
  ) : (
    <>
      {isFetching ? <div>重新整理中...</div> : null}

      <div>
        {todos.map((todo) => (
          <Todo todo={todo} />
        ))}
      </div>
    </>
  )
}
```

[//]: # '範例'

## 顯示全域背景擷取載入狀態

除了個別查詢的載入狀態外，如果您希望在**任何**查詢正在擷取時（包括在背景中）顯示全域載入指示器，您可以使用 `useIsFetching` 鉤子 (hook)：

[//]: # '範例2'

```tsx
import { useIsFetching } from '@tanstack/react-query'

function GlobalLoadingIndicator() {
  const isFetching = useIsFetching()

  return isFetching ? <div>查詢正在背景中擷取...</div> : null
}
```

[//]: # '範例2'
