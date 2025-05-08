---
source-updated-at: '2025-02-02T18:26:57.000Z'
translation-updated-at: '2025-05-08T20:24:52.117Z'
id: query-options
title: 查詢選項
---

在多重使用場景中共享 `queryKey` 和 `queryFn` 卻又能保持它們彼此關聯的最佳方式之一，就是使用 `queryOptions` 輔助工具。在運行時，這個輔助工具僅會回傳你傳入的內容，但當[與 TypeScript 搭配使用](../typescript.md#typing-query-options)時，它能帶來許多優勢。你可以在單一位置定義查詢的所有可能選項，同時還能獲得完整的型別推論與型別安全檢查。

```ts
import { queryOptions } from '@tanstack/angular-query-experimental'

@Injectable({
  providedIn: 'root',
})
export class QueriesService {
  private http = inject(HttpClient)

  post(postId: number) {
    return queryOptions({
      queryKey: ['post', postId],
      queryFn: () => {
        return lastValueFrom(
          this.http.get<Post>(
            `https://jsonplaceholder.typicode.com/posts/${postId}`,
          ),
        )
      },
    })
  }
}

// 使用方式：

postId = input.required({
  transform: numberAttribute,
})
queries = inject(QueriesService)

postQuery = injectQuery(() => this.queries.post(this.postId()))

queryClient.prefetchQuery(this.queries.post(23))
queryClient.setQueryData(this.queries.post(42).queryKey, newPost)
```

針對無限查詢 (Infinite Queries)，另有獨立的 [`infiniteQueryOptions`](../reference/infiniteQueryOptions.md) 輔助工具可供使用。

你仍可在元件層級覆寫部分選項。一個極其常見且實用的模式是建立每個元件專屬的 [`select`](./render-optimizations.md#select) 函式：

```ts
// 型別推論依然有效，因此 query.data 會是 select 的回傳型別而非 queryFn 的
queries = inject(QueriesService)

query = injectQuery(() => ({
  ...groupOptions(1),
  select: (data) => data.title,
}))
```
