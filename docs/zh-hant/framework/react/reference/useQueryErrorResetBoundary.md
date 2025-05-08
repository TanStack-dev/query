---
source-updated-at: '2024-04-11T09:16:39.000Z'
translation-updated-at: '2025-05-08T20:19:13.684Z'
id: useQueryErrorResetBoundary
title: useQueryErrorResetBoundary
---

這個鉤子 (hook) 會重置最接近的 `QueryErrorResetBoundary` 內任何查詢錯誤。如果沒有定義邊界 (boundary)，則會全域重置這些錯誤：

```tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          There was an error!
          <Button onClick={() => resetErrorBoundary()}>Try again</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```
