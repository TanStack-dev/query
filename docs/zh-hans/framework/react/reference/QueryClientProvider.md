---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:41:57.472Z'
id: QueryClientProvider
title: QueryClientProvider
---
使用 `QueryClientProvider` 组件将 `QueryClient` 连接并提供给您的应用：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**配置项**

- `client: QueryClient`
  - **必填**
  - 需要提供的 QueryClient 实例
