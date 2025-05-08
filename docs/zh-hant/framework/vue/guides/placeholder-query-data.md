---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:36.160Z'
id: placeholder-query-data
title: 佔位查詢資料
---

## 什麼是預留位置資料 (placeholder data)？

預留位置資料讓查詢 (query) 能表現得像已經有資料一樣，類似 `initialData` 選項，但**這些資料不會被持久化到快取 (cache)**。這在以下情境非常實用：當您有足夠的部分（或模擬）資料可以成功渲染查詢，同時在背景取得實際資料。

> 範例：單篇部落格文章的查詢可以從父層的部落格文章列表中提取「預覽」資料，該列表僅包含標題和文章內容的一小段摘要。您不會想把這些部分資料持久化到單篇文章查詢的結果中，但對於盡快顯示內容佈局非常有用，同時等待實際查詢完成取得完整物件。

有幾種方式可以在需要之前為查詢提供預留位置資料到快取：

- 宣告式 (Declaratively)：
  - 提供 `placeholderData` 給查詢，以便在快取為空時預先填充
- 命令式 (Imperatively)：
  - [使用 `queryClient` 和 `placeholderData` 選項預取或取得資料](./prefetching.md)

當我們使用 `placeholderData` 時，我們的查詢不會處於 `pending` 狀態——它會從一開始就處於 `success` 狀態，因為我們有 `data` 可以顯示——即使這些資料只是「預留位置」資料。為了區分它與「真實」資料，我們還會在查詢結果中將 `isPlaceholderData` 標記設為 `true`。

## 預留位置資料作為值

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  placeholderData: placeholderTodos,
})
```

## 預留位置資料作為函式

`placeholderData` 也可以是一個函式，您可以在其中存取「先前」成功查詢的資料和查詢元資訊 (meta information)。這在您想將一個查詢的資料用作另一個查詢的預留位置資料時非常有用。當查詢鍵 (QueryKey) 變更時，例如從 `['todos', 1]` 變為 `['todos', 2]`，我們可以繼續顯示「舊」資料，而不必在資料從一個查詢「過渡」到下一個時顯示載入動畫。更多資訊請參見[分頁查詢 (Paginated Queries)](./paginated-queries.md)。

```tsx
const result = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetch(`/todos/${id}`),
  placeholderData: (previousData, previousQuery) => previousData,
})
```

### 從快取取得預留位置資料

在某些情況下，您可能可以從另一個查詢的快取結果中為當前查詢提供預留位置資料。一個很好的例子是：從部落格文章列表查詢的快取資料中搜尋文章的預覽版本，然後將其用作單篇文章查詢的預留位置資料：

```tsx
const result = useQuery({
  queryKey: ['blogPost', blogPostId],
  queryFn: () => fetch(`/blogPosts/${blogPostId}`),
  placeholderData: () => {
    // 使用來自 'blogPosts' 查詢的較小/預覽版本的部落格文章
    // 作為此部落格文章查詢的預留位置資料
    return queryClient
      .getQueryData(['blogPosts'])
      ?.find((d) => d.id === blogPostId)
  },
})
```
