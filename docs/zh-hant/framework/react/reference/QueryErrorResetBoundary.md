---
source-updated-at: '2024-04-11T09:16:39.000Z'
translation-updated-at: '2025-05-08T20:19:49.451Z'
id: QueryErrorResetBoundary
title: QueryErrorResetBoundary
---

當你在查詢中使用 **suspense** 或 **throwOnError** 時，需要一種方式讓查詢知道，當發生錯誤後重新渲染時，你想要再次嘗試。透過 `QueryErrorResetBoundary` 元件，你可以重置該元件範圍內任何查詢的錯誤狀態。

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const App = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
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
    )}
  </QueryErrorResetBoundary>
)
```
