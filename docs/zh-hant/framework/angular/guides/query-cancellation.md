---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-08T20:25:16.314Z'
id: query-cancellation
title: 查詢取消
---

TanStack Query 為每個查詢函式提供了一個 [`AbortSignal` 實例](https://developer.mozilla.org/docs/Web/API/AbortSignal)。當查詢過時或變為非活動狀態時，此 `signal` 將被中止。這意味著所有查詢都是可取消的，並且您可以根據需要在查詢函式中響應取消操作。最棒的是，這讓您可以繼續使用普通的 async/await 語法，同時獲得自動取消的所有好處。

## 預設行為

預設情況下，在 Promise 解析之前卸載或變為未使用的查詢 _不會_ 被取消。這意味著在 Promise 解析後，結果資料將保留在快取中。如果您已經開始接收查詢，但在查詢完成前卸載了元件，這會很有幫助。如果您再次掛載元件且查詢尚未被垃圾回收，資料仍然可用。

然而，如果您使用了 `AbortSignal`，Promise 將被取消（例如中止 fetch 請求），因此查詢也必須被取消。取消查詢將導致其狀態 _恢復_ 到先前的狀態。

## 使用 `HttpClient`

```ts
import { HttpClient } from '@angular/common/http'
import { injectQuery } from '@tanstack/angular-query-experimental'

postQuery = injectQuery(() => ({
  enabled: this.postId() > 0,
  queryKey: ['post', this.postId()],
  queryFn: async (context): Promise<Post> => {
    const abort$ = fromEvent(context.signal, 'abort')
    return lastValueFrom(this.getPost$(this.postId()).pipe(takeUntil(abort$)))
  },
}))
```

## 使用 `fetch`

[//]: # 'Example2'

```ts
query = injectQuery(() => ({
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
}))
```

[//]: # 'Example2'

## 使用 `axios`

[//]: # 'Example3'

```tsx
import axios from 'axios'

const query = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: ({ signal }) =>
    axios.get('/todos', {
      // 將 signal 傳遞給 `axios`
      signal,
    }),
}))
```

[//]: # 'Example3'

## 手動取消

您可能需要手動取消查詢。例如，如果請求需要很長時間才能完成，您可以允許使用者點擊取消按鈕來停止請求。為此，您只需呼叫 `queryClient.cancelQueries({ queryKey })`，這將取消查詢並將其恢復到先前的狀態。如果您使用了傳遞給查詢函式的 `signal`，TanStack Query 還會額外取消 Promise。

[//]: # 'Example7'

```angular-ts
@Component({
  standalone: true,
  template: `<button (click)="onCancel()">Cancel</button>`,
})
export class TodosComponent {
  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: async ({ signal }) => {
      const resp = await fetch('/todos', { signal })
      return resp.json()
    },
  }))

  queryClient = inject(QueryClient)

  onCancel() {
    this.queryClient.cancelQueries(['todos'])
  }
}
```

[//]: # 'Example7'
