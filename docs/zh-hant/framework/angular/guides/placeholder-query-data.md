---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-08T20:25:30.490Z'
id: placeholder-query-data
title: 佔位查詢資料
---

## 什麼是預留位置資料 (placeholder data)？

預留位置資料允許查詢 (query) 表現得像已經擁有資料一樣，類似於 `initialData` 選項，但**這些資料不會被持久化到快取 (cache)**。這在以下情況特別有用：當你擁有足夠的部分（或模擬）資料可以成功渲染查詢結果，同時在背景中獲取實際資料。

> 範例：單篇部落格文章的查詢可以從父層的部落格文章列表中提取「預覽」資料，這些預覽資料僅包含標題和文章內容的一小段摘要。雖然你不會想將這些部分資料持久化到單一查詢的結果中，但它對於盡快顯示內容佈局非常有用，同時實際查詢會繼續獲取完整的物件。

有幾種方法可以在需要之前為查詢提供預留位置資料到快取中：

- 宣告式 (Declaratively)：
  - 提供 `placeholderData` 給查詢，以便在快取為空時預先填充
- 命令式 (Imperatively)：
  - [使用 `queryClient` 和 `placeholderData` 選項預取 (prefetch) 或獲取資料](./prefetching.md)

當我們使用 `placeholderData` 時，查詢不會處於 `pending` 狀態——它會從 `success` 狀態開始，因為我們有 `data` 可以顯示，即使這些資料只是「預留位置」資料。為了區分它與「真實」資料，我們還會在查詢結果中將 `isPlaceholderData` 標記設為 `true`。

## 預留位置資料作為值

```ts
class TodosComponent {
  result = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData: placeholderTodos,
  }))
}
```

## 預留位置資料作為函式

`placeholderData` 也可以是一個函式，讓你可以存取「先前」成功查詢的資料和查詢元資訊 (meta information)。這在以下情況非常有用：當你想使用一個查詢的資料作為另一個查詢的預留位置資料時。當查詢鍵 (QueryKey) 變更時（例如從 `['todos', 1]` 變為 `['todos', 2]`），我們可以繼續顯示「舊」資料，而不必在資料從一個查詢過渡到下一個查詢時顯示載入指示器 (loading spinner)。更多資訊請參見[分頁查詢 (Paginated Queries)](./paginated-queries.md)。

```ts
class TodosComponent {
  result = injectQuery(() => ({
    queryKey: ['todos', id()],
    queryFn: () => fetch(`/todos/${id}`),
    placeholderData: (previousData, previousQuery) => previousData,
  }))
}
```

### 從快取中獲取預留位置資料

在某些情況下，你可以從另一個查詢的快取結果中為當前查詢提供預留位置資料。一個很好的例子是：從部落格文章列表查詢的快取資料中搜尋文章的預覽版本，然後將其用作單篇文章查詢的預留位置資料：

```ts
export class BlogPostComponent {
  // Until Angular supports signal-based inputs, we have to set a signal
  @Input({ required: true, alias: 'postId' })
  set _postId(value: number) {
    this.postId.set(value)
  }
  postId = signal(0)
  queryClient = inject(QueryClient)

  result = injectQuery(() => ({
    queryKey: ['blogPost', this.postId()],
    queryFn: () => fetch(`/blogPosts/${this.postId()}`),
    placeholderData: () => {
      // Use the smaller/preview version of the blogPost from the 'blogPosts'
      // query as the placeholder data for this blogPost query
      return queryClient
        .getQueryData(['blogPosts'])
        ?.find((d) => d.id === this.postId())
    },
  }))
}
```
