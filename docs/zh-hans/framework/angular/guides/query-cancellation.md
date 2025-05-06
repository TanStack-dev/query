---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-06T04:57:20.291Z'
id: query-cancellation
title: 查询取消
---
TanStack Query 为每个查询函数提供了一个 [`AbortSignal` 实例](https://developer.mozilla.org/docs/Web/API/AbortSignal)。当查询过期或变为非活跃状态时，该 `signal` 会被中止。这意味着所有查询均可取消，并且您可以根据需要在查询函数内部响应取消操作。最棒的是，它允许您继续使用普通的 async/await 语法，同时获得自动取消的所有优势。

## 默认行为

默认情况下，在 Promise 解析之前卸载或不再使用的查询_不会_被取消。这意味着 Promise 解析后，结果数据仍会保留在缓存中。这对于已经开始接收查询但随后在完成前卸载组件的情况非常有用。如果您再次挂载组件且查询尚未被垃圾回收，数据将仍然可用。

然而，如果您使用了 `AbortSignal`，Promise 将被取消（例如中止 fetch 请求），因此查询也必须被取消。取消查询将导致其状态_回退_到之前的状态。

## 使用 `HttpClient`

```ts
import { HttpClient } from '@angular/common/http'
import { injectQuery } from '@tanstack/angular-query-experimental'

postQuery = injectQuery(() => ({
  enabled: this.postId() > 0,
  queryKey: ['post', this.postId()],
  queryFn: async (context): Promise<Post> => {
    const abort$ = fromEvent(context.signal, 'abort')
    return lastValueFrom(this.getPost$(this.postId()).pipe(takeUntil(abort$))
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
      // 将 signal 传递给 fetch
      signal,
    })
    const todos = await todosResponse.json()

    const todoDetails = todos.map(async ({ details }) => {
      const response = await fetch(details, {
        // 或者传递给多个请求
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
      // 将 signal 传递给 `axios`
      signal,
    }),
}))
```

[//]: # 'Example3'

## 手动取消

您可能需要手动取消查询。例如，如果请求需要很长时间才能完成，您可以允许用户点击取消按钮来停止请求。为此，只需调用 `queryClient.cancelQueries({ queryKey })`，这将取消查询并将其状态回退到之前的状态。如果您已经使用了传递给查询函数的 `signal`，TanStack Query 还会额外取消 Promise。

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
