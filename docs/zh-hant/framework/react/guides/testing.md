---
source-updated-at: '2025-03-24T10:00:44.000Z'
translation-updated-at: '2025-05-08T20:21:28.584Z'
id: testing
title: 測試
---

# 測試

React Query 透過鉤子 (hooks) 運作 — 無論是我們提供的鉤子，或是封裝它們的自訂鉤子。

在 React 17 或更早版本中，可以使用 [React Hooks Testing Library](https://react-hooks-testing-library.com/) 函式庫來為這些自訂鉤子撰寫單元測試。

透過以下指令安裝：

```sh
npm install @testing-library/react-hooks react-test-renderer --save-dev
```

（`react-test-renderer` 函式庫是 `@testing-library/react-hooks` 的必要相依套件，其版本需與你使用的 React 版本相對應。）

_注意_：使用 React 18 或更新版本時，`renderHook` 可直接透過 `@testing-library/react` 套件取得，不再需要 `@testing-library/react-hooks`。

## 第一個測試

安裝完成後，即可撰寫簡單的測試。假設有以下自訂鉤子：

```tsx
export function useCustomHook() {
  return useQuery({ queryKey: ['customHook'], queryFn: () => 'Hello' })
}
```

我們可以為此撰寫如下測試：

```tsx
import { renderHook, waitFor } from '@testing-library/react'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const { result } = renderHook(() => useCustomHook(), { wrapper })

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data).toEqual('Hello')
```

請注意，我們提供了一個自訂的封裝器 (wrapper)，用於建立 `QueryClient` 和 `QueryClientProvider`。這有助於確保我們的測試完全與其他測試隔離。

可以只撰寫一次此封裝器，但若如此，我們需要確保在每個測試前清除 `QueryClient`，且測試不會並行執行，否則一個測試會影響其他測試的結果。

## 關閉重試機制

函式庫預設會進行三次指數退避 (exponential backoff) 重試，這意味著如果你想測試一個錯誤查詢，測試很可能會超時。最簡單的關閉重試方式是透過 `QueryClientProvider`。讓我們擴展上述範例：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ 關閉重試
      retry: false,
    },
  },
})
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
```

這會將元件樹中所有查詢的預設值設為「不重試」。重要的是要了解，這僅在你的實際 `useQuery` 沒有明確設定重試次數時才有效。如果某個查詢設定為重試 5 次，這仍會優先，因為預設值僅作為後備選項。

## 在 Jest 中將 gcTime 設為 Infinity

如果你使用 Jest，可以將 `gcTime` 設為 `Infinity` 以避免「Jest 在測試執行完成後一秒內未退出」的錯誤訊息。這是伺服器端的預設行為，僅在明確設定 `gcTime` 時才需要調整。

## 測試網路請求

React Query 的主要用途是快取網路請求，因此我們必須能夠測試程式碼是否正確發起網路請求。

有許多方法可以測試這點，但在這個範例中，我們將使用 [nock](https://www.npmjs.com/package/nock)。

假設有以下自訂鉤子：

```tsx
function useFetchData() {
  return useQuery({
    queryKey: ['fetchData'],
    queryFn: () => request('/api/data'),
  })
}
```

我們可以為此撰寫如下測試：

```tsx
const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const expectation = nock('http://example.com').get('/api/data').reply(200, {
  answer: 42,
})

const { result } = renderHook(() => useFetchData(), { wrapper })

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data).toEqual({ answer: 42 })
```

這裡我們使用 `waitFor` 並等待查詢狀態顯示請求已成功。這樣我們就能確定鉤子已完成執行且應包含正確資料。_注意_：使用 React 18 時，`waitFor` 的語意已變更，如上所述。

## 測試載入更多 / 無限滾動

首先需要模擬 API 回應：

```tsx
function generateMockedResponse(page) {
  return {
    page: page,
    items: [...]
  }
}
```

接著，我們的 `nock` 配置需根據頁面區分回應，並使用 `uri` 來實現。此處 `uri` 的值會類似 `"/?page=1` 或 `/?page=2`：

```tsx
const expectation = nock('http://example.com')
  .persist()
  .query(true)
  .get('/api/data')
  .reply(200, (uri) => {
    const url = new URL(`http://example.com${uri}`)
    const { page } = Object.fromEntries(url.searchParams)
    return generateMockedResponse(page)
  })
```

（注意 `.persist()`，因為我們會多次呼叫此端點）

現在可以安全地執行測試，關鍵在於等待資料斷言通過：

```tsx
const { result } = renderHook(() => useInfiniteQueryCustomHook(), {
  wrapper,
})

await waitFor(() => expect(result.current.isSuccess).toBe(true))

expect(result.current.data.pages).toStrictEqual(generateMockedResponse(1))

result.current.fetchNextPage()

await waitFor(() =>
  expect(result.current.data.pages).toStrictEqual([
    ...generateMockedResponse(1),
    ...generateMockedResponse(2),
  ]),
)

expectation.done()
```

_注意_：使用 React 18 時，`waitFor` 的語意已變更，如上所述。

## 延伸閱讀

如需更多技巧及使用 `mock-service-worker` 的替代設定，請參閱社群資源中的 [Testing React Query](../community/tkdodos-blog.md#5-testing-react-query)。
