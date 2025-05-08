---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:19:46.178Z'
id: QueryClientProvider
title: QueryClientProvider
---

使用 `QueryClientProvider` 元件來連接並為你的應用程式提供一個 `QueryClient`：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**選項**

- `client: QueryClient`
  - **必填**
  - 要提供的 QueryClient 實例
