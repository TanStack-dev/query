---
source-updated-at: '2025-02-02T18:26:57.000Z'
translation-updated-at: '2025-05-06T04:53:28.456Z'
id: query-options
title: 查询选项
---

在多个地方共享 `queryKey` 和 `queryFn` 同时保持它们彼此关联的最佳方式之一是使用 `queryOptions` 辅助函数。在运行时，该辅助函数仅返回传入的内容，但[结合 TypeScript 使用时](../typescript.md#typing-query-options)能提供诸多优势。您可以在一个地方定义查询的所有可能选项，并同时获得类型推断和类型安全。

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

// 使用示例:

postId = input.required({
  transform: numberAttribute,
})
queries = inject(QueriesService)

postQuery = injectQuery(() => this.queries.post(this.postId()))

queryClient.prefetchQuery(this.queries.post(23))
queryClient.setQueryData(this.queries.post(42).queryKey, newPost)
```

对于无限查询 (Infinite Queries)，另有专用的 [`infiniteQueryOptions`](../reference/infiniteQueryOptions.md) 辅助函数可用。

您仍可在组件级别覆盖某些选项。一个非常常见且实用的模式是为每个组件创建 [`select`](./render-optimizations.md#select) 函数：

```ts
// 类型推断仍然有效，因此 query.data 将是 select 的返回类型而非 queryFn 的返回类型
queries = inject(QueriesService)

query = injectQuery(() => ({
  ...groupOptions(1),
  select: (data) => data.title,
}))
```
