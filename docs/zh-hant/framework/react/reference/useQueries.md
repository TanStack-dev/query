---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:38.883Z'
id: useQueries
title: useQueries
---

`useQueries` 鉤子 (hook) 可用於獲取數量不固定的查詢 (queries)：

```tsx
const ids = [1, 2, 3]
const results = useQueries({
  queries: ids.map((id) => ({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    staleTime: Infinity,
  })),
})
```

**選項**

`useQueries` 鉤子接受一個選項物件，其中包含一個 **queries** 鍵，其值為一個陣列，陣列中的查詢選項物件與 [`useQuery` 鉤子](../reference/useQuery.md) 完全相同（不包括 `queryClient` 選項，因為 `QueryClient` 可以在頂層傳入）。

- `queryClient?: QueryClient`
  - 用於提供自訂的 QueryClient。若未提供，則會使用最近上下文中的 QueryClient。
- `combine?: (result: UseQueriesResults) => TCombinedResult`
  - 用於將多個查詢的結果合併為單一值。

> 若在查詢物件陣列中多次使用相同的查詢鍵 (query key)，可能會導致查詢之間共享部分數據。為避免此情況，建議去除重複查詢並將結果映射回所需結構。

**placeholderData**

`useQueries` 也有 `placeholderData` 選項，但它不會像 `useQuery` 那樣從先前渲染的查詢中獲取資訊，因為 `useQueries` 的輸入在每次渲染時可能包含不同數量的查詢。

**返回值**

`useQueries` 鉤子返回一個包含所有查詢結果的陣列，其順序與輸入順序相同。

## 合併結果

如果想將結果中的 `data`（或其他查詢資訊）合併為單一值，可以使用 `combine` 選項。返回的結果會盡可能保持結構共享 (structurally shared)，以確保引用穩定性 (referentially stable)。

```tsx
const ids = [1, 2, 3]
const combinedQueries = useQueries({
  queries: ids.map((id) => ({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  })),
  combine: (results) => {
    return {
      data: results.map((result) => result.data),
      pending: results.some((result) => result.isPending),
    }
  },
})
```

在上述範例中，`combinedQueries` 會是一個包含 `data` 和 `pending` 屬性的物件。請注意，查詢結果的其他屬性將會丟失。

### 記憶化 (Memoization)

`combine` 函數僅在以下情況下重新執行：

- `combine` 函數本身的引用發生變化
- 任何查詢結果發生變化

這意味著像上面範例中直接內聯的 `combine` 函數會在每次渲染時執行。為避免此情況，可以將 `combine` 函數用 `useCallback` 包裹，或將其提取為一個穩定的函數引用（如果它沒有依賴項）。
