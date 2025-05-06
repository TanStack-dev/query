---
source-updated-at: '2024-11-20T12:58:00.000Z'
translation-updated-at: '2025-05-06T05:03:00.167Z'
id: query-options
title: 变更选项
---

在多个地方共享变更选项 (mutation options) 的最佳方式之一，就是使用 `mutationOptions` 辅助函数。在运行时，这个辅助函数会原样返回你传入的内容，但[配合 TypeScript](../../typescript#typing-query-options) 使用时能带来诸多优势。你可以在一个地方定义变更操作的所有可能选项，同时还能获得完整的类型推断和类型安全。

```ts
export class QueriesService {
  private http = inject(HttpClient)

  updatePost(id: number) {
    return mutationOptions({
      mutationFn: (post: Post) => Promise.resolve(post),
      mutationKey: ['updatePost', id],
      onSuccess: (newPost) => {
        //           ^? newPost: Post
        this.queryClient.setQueryData(['posts', id], newPost)
      },
    })
  }
}
```
