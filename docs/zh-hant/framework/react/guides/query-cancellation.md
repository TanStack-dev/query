---
source-updated-at: '2025-03-31T09:10:06.000Z'
translation-updated-at: '2025-05-08T20:22:27.442Z'
id: query-cancellation
title: 查詢取消
---

TanStack Query 會為每個查詢函數提供一個 [`AbortSignal` 實例](https://developer.mozilla.org/docs/Web/API/AbortSignal)。當查詢過時或變為非活動狀態時，這個 `signal` 將會被中止。這意味著所有查詢都是可取消的，並且您可以根據需求在查詢函數中響應取消操作。最棒的是，這讓您可以繼續使用普通的 async/await 語法，同時獲得自動取消的所有好處。

`AbortController` API 在[大多數運行環境](https://developer.mozilla.org/docs/Web/API/AbortController#browser_compatibility)中都可用，但如果您的運行環境不支援它，則需要提供一個 polyfill。這裡有[幾個可用的選項](https://www.npmjs.com/search?q=abortcontroller%20polyfill)。

## 預設行為

預設情況下，查詢在卸載或變為未使用時（在其 Promise 解析之前）*不會*被取消。這意味著在 Promise 解析後，結果資料將會保留在快取中。這對於您已經開始接收查詢，但在完成之前卸載元件的情況很有幫助。如果您再次掛載元件且查詢尚未被垃圾回收，資料將會可用。

然而，如果您使用了 `AbortSignal`，Promise 將會被取消（例如中止 fetch 請求），因此查詢也必須被取消。取消查詢將導致其狀態*恢復*到先前的狀態。

## 使用 `fetch`

[//]: # '範例'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const todosResponse = await fetch('/todos', {
      // 將 signal 傳遞給 fetch
      signal,
    })
    const todos = await todosResponse.json()

    const todoDetails = todos.map(async ({ details }) => {
      const response = await fetch(details, {
        // 或傳遞給多個請求
        signal,
      })
      return response.json()
    })

    return Promise.all(todoDetails)
  },
})
```

[//]: # '範例'

## 使用 `axios` [v0.22.0+](https://github.com/axios/axios/releases/tag/v0.22.0)

[//]: # '範例2'

```tsx
import axios from 'axios'

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) =>
    axios.get('/todos', {
      // 將 signal 傳遞給 `axios`
      signal,
    }),
})
```

[//]: # '範例2'

### 使用 `axios` v0.22.0 以下版本

[//]: # '範例3'

```tsx
import axios from 'axios'

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    // 為此請求建立一個新的 CancelToken 來源
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const promise = axios.get('/todos', {
      // 將來源 token 傳遞給您的請求
      cancelToken: source.token,
    })

    // 如果 TanStack Query 發出中止信號，則取消請求
    signal?.addEventListener('abort', () => {
      source.cancel('查詢已被 TanStack Query 取消')
    })

    return promise
  },
})
```

[//]: # '範例3'

## 使用 `XMLHttpRequest`

[//]: # '範例4'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    return new Promise((resolve, reject) => {
      var oReq = new XMLHttpRequest()
      oReq.addEventListener('load', () => {
        resolve(JSON.parse(oReq.responseText))
      })
      signal?.addEventListener('abort', () => {
        oReq.abort()
        reject()
      })
      oReq.open('GET', '/todos')
      oReq.send()
    })
  },
})
```

[//]: # '範例4'

## 使用 `graphql-request`

可以在客戶端的 `request` 方法中設定 `AbortSignal`。

[//]: # '範例5'

```tsx
const client = new GraphQLClient(endpoint)

const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    client.request({ document: query, signal })
  },
})
```

[//]: # '範例5'

## 使用 `graphql-request` v4.0.0 以下版本

可以在 `GraphQLClient` 的建構函式中設定 `AbortSignal`。

[//]: # '範例6'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    const client = new GraphQLClient(endpoint, {
      signal,
    })
    return client.request(query, variables)
  },
})
```

[//]: # '範例6'

## 手動取消

您可能需要手動取消查詢。例如，如果請求需要很長時間才能完成，您可以允許使用者點擊取消按鈕來停止請求。為此，您只需要呼叫 `queryClient.cancelQueries({ queryKey })`，這將取消查詢並將其恢復到先前的狀態。如果您已經使用了傳遞給查詢函數的 `signal`，TanStack Query 還會額外取消 Promise。

[//]: # '範例7'

```tsx
const query = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const resp = await fetch('/todos', { signal })
    return resp.json()
  },
})

const queryClient = useQueryClient()

return (
  <button
    onClick={(e) => {
      e.preventDefault()
      queryClient.cancelQueries({ queryKey: ['todos'] })
    }}
  >
    取消
  </button>
)
```

[//]: # '範例7'

## 限制

當使用 `Suspense` 鉤子時，取消功能無法運作：`useSuspenseQuery`、`useSuspenseQueries` 和 `useSuspenseInfiniteQuery`。
