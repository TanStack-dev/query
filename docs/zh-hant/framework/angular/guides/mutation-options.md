---
source-updated-at: '2025-04-13T18:21:31.000Z'
translation-updated-at: '2025-05-08T20:25:28.228Z'
id: query-options
title: 變更選項
---

在多重使用情境間共享變更選項 (mutation options) 的最佳方式之一，就是使用 `mutationOptions` 輔助函式。在運行時，這個輔助函式僅會回傳你傳入的內容，但當[與 TypeScript 搭配使用](../../typescript#typing-query-options.md)時，它能帶來許多優勢。你可以在單一位置定義變更操作的所有可能選項，同時還能獲得完整的型別推論與型別安全檢查。

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
