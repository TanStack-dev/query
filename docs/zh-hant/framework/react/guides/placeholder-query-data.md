---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:22:21.696Z'
id: placeholder-query-data
title: 佔位查詢資料
---

## 什麼是預留位置資料 (placeholder data)？

預留位置資料讓查詢 (query) 能表現得像已經擁有資料一樣，類似於 `initialData` 選項，但**這些資料不會被持久化到快取中**。這在以下情境特別有用：當你擁有足夠的部分（或模擬）資料可以成功渲染查詢，同時在背景中獲取實際資料時。

> 範例：一篇部落格文章的查詢可以從父層的部落格文章列表中提取「預覽」資料，該列表僅包含標題和文章內容的一小段摘要。你可能不希望將這部分資料持久化到個別查詢的結果中，但它在盡快顯示內容佈局方面非常有用，同時實際查詢會完成獲取完整物件。

有幾種方式可以在需要之前為查詢提供預留位置資料到快取中：

- 宣告式：
  - 提供 `placeholderData` 給查詢，以便在快取為空時預先填充
- 命令式：
  - [使用 `queryClient` 和 `placeholderData` 選項預取或獲取資料](./prefetching.md)

當我們使用 `placeholderData` 時，查詢不會處於 `pending` 狀態——它會從 `success` 狀態開始，因為我們有 `data` 可以顯示——即使這些資料只是「預留位置」資料。為了區分它與「真實」資料，我們還會在查詢結果中將 `isPlaceholderData` 標記設為 `true`。

## 預留位置資料作為值

[//]: # 'ExampleValue'

```tsx
function Todos() {
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData: placeholderTodos,
  })
}
```

[//]: # 'ExampleValue'
[//]: # 'Memoization'

### 預留位置資料的記憶化 (memoization)

如果獲取查詢的預留位置資料的過程很耗資源，或者你不想在每次渲染時都執行，可以將值記憶化：

```tsx
function Todos() {
  const placeholderData = useMemo(() => generateFakeTodos(), [])
  const result = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/todos'),
    placeholderData,
  })
}
```

[//]: # 'Memoization'

## 預留位置資料作為函式

`placeholderData` 也可以是一個函式，讓你能夠存取「先前」成功查詢的資料和查詢元資訊。這在你想使用一個查詢的資料作為另一個查詢的預留位置資料時特別有用。當查詢鍵 (QueryKey) 改變時，例如從 `['todos', 1]` 變為 `['todos', 2]`，我們可以繼續顯示「舊」資料，而不必在資料從一個查詢過渡到下一個時顯示載入動畫。更多資訊請參閱[分頁查詢](./paginated-queries.md)。

[//]: # 'ExampleFunction'

```tsx
const result = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetch(`/todos/${id}`),
  placeholderData: (previousData, previousQuery) => previousData,
})
```

[//]: # 'ExampleFunction'

### 從快取中獲取預留位置資料

在某些情況下，你可以從另一個查詢的快取結果中為查詢提供預留位置資料。一個很好的例子是從部落格文章列表查詢的快取資料中搜索文章的預覽版本，然後將其用作個別文章查詢的預留位置資料：

[//]: # 'ExampleCache'

```tsx
function Todo({ blogPostId }) {
  const queryClient = useQueryClient()
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
}
```

[//]: # 'ExampleCache'
[//]: # 'Materials'

## 延伸閱讀

如需比較 `預留位置資料` 和 `初始資料`，請參閱[社群資源](../community/tkdodos-blog.md#9-placeholder-and-initial-data-in-react-query)。

[//]: # 'Materials'
