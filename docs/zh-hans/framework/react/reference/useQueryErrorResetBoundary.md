---
source-updated-at: '2024-04-11T09:16:39.000Z'
translation-updated-at: '2025-05-06T04:33:21.777Z'
id: useQueryErrorResetBoundary
title: useQueryErrorResetBoundary
---

该钩子函数会重置最近一层 `QueryErrorResetBoundary` 内的所有查询错误。如果未定义边界，则会全局重置错误：

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
          发生错误！
          <Button onClick={() => resetErrorBoundary()}>重试</Button>
        </div>
      )}
    >
      <Page />
    </ErrorBoundary>
  )
}
```
