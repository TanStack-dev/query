---
source-updated-at: '2024-09-26T17:04:33.000Z'
translation-updated-at: '2025-05-08T20:14:53.379Z'
id: stable-query-client
title: 穩定查詢客戶端
---

QueryClient 包含 QueryCache，因此你應該只在應用程式的生命週期中建立一個 QueryClient 實例，而不是在每次渲染時都建立新實例。

> 例外：允許在非同步伺服器元件 (async Server Component) 中建立新的 QueryClient，因為該非同步函式僅會在伺服器端呼叫一次。

## 規則詳情

以下為**不正確**的程式碼範例：

```tsx
/* eslint "@tanstack/query/stable-query-client": "error" */

function App() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

以下為**正確**的程式碼範例：

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
const queryClient = new QueryClient()
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
async function App() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(options)
}
```

## 屬性

- [x] ✅ 推薦
- [x] 🔧 可自動修復
