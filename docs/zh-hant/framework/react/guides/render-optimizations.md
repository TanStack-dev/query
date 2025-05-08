---
source-updated-at: '2025-04-29T10:48:29.000Z'
translation-updated-at: '2025-05-08T20:21:38.387Z'
id: render-optimizations
title: 渲染優化
---

React Query 會自動應用幾項優化措施，確保元件只在真正需要時才重新渲染。以下是實現此目標的方式：

## 結構共享 (structural sharing)

React Query 使用稱為「結構共享」的技術，確保在重新渲染時盡可能保持最多的引用不變。如果資料是透過網路請求取得，通常透過 JSON 解析回應會得到一個全新的引用。然而，如果資料中的內容**沒有任何變化**，React Query 會保持原始引用不變。如果只有部分資料變更，React Query 會保留未變更的部分，僅替換變更的部分。

> 注意：此優化僅在 `queryFn` 回傳 JSON 相容資料時有效。你可以透過全域設定 `structuralSharing: false` 或在單一查詢中關閉此功能，也可以透過傳入自訂函數來實作自己的結構共享邏輯。

### 引用一致性 (referential identity)

從 `useQuery`、`useInfiniteQuery`、`useMutation` 回傳的頂層物件，以及 `useQueries` 回傳的陣列，**並不具備引用穩定性**。每次渲染時都會產生新的引用。然而，這些 Hook 回傳的 `data` 屬性會盡可能保持穩定。

## 追蹤屬性 (tracked properties)

React Query 只會在 `useQuery` 回傳的屬性被實際「使用」時觸發重新渲染。這是透過 [Proxy 物件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 實現的。此機制避免了許多不必要的重新渲染，例如 `isFetching` 或 `isStale` 等屬性可能頻繁變更，但元件中並未使用這些屬性時。

你可以透過全域設定或單一查詢中手動設定 `notifyOnChangeProps` 來自訂此功能。若要完全關閉此功能，可設定 `notifyOnChangeProps: 'all'`。

> 注意：Proxy 的 get trap 會在存取屬性時觸發，無論是透過解構賦值還是直接存取。如果使用物件剩餘解構 (object rest destructuring)，將會停用此優化。我們提供了 [lint 規則](../../../eslint/no-rest-destructuring.md) 來防止此問題。

## select 選項

你可以使用 `select` 選項來選擇元件應訂閱的資料子集。這對於高度優化的資料轉換或避免不必要的重新渲染非常有用。

```js
export const useTodos = (select) => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  })
}

export const useTodoCount = () => {
  return useTodos((data) => data.length)
}
```

使用 `useTodoCount` 自訂 Hook 的元件只會在待辦事項的數量變更時重新渲染。即使某個待辦事項的名稱變更，元件也**不會**重新渲染。

> 注意：`select` 僅作用於已成功快取的資料，不適合在此處拋出錯誤。錯誤的來源應是 `queryFn`，若 `select` 函數回傳錯誤，會導致 `data` 為 `undefined` 且 `isSuccess` 為 `true`。建議在 `queryFn` 中處理錯誤，或將與快取無關的錯誤處理邏輯放在查詢 Hook 之外。

### 記憶化 (memoization)

`select` 函數只會在以下情況重新執行：

- `select` 函數本身的引用發生變化
- `data` 發生變更

這表示像上面範例中直接內聯的 `select` 函數會在每次渲染時執行。若要避免此情況，可以將 `select` 函數用 `useCallback` 包裹，或將其提取為無依賴的穩定函數引用：

```js
// 使用 useCallback 包裹
export const useTodoCount = () => {
  return useTodos(useCallback((data) => data.length, []))
}
```

```js
// 提取為穩定的函數引用
const selectTodoCount = (data) => data.length

export const useTodoCount = () => {
  return useTodos(selectTodoCount)
}
```

## 延伸閱讀

關於這些主題的深入指南，請參閱社群資源中的 [React Query 渲染優化](../community/tkdodos-blog.md#3-react-query-render-optimizations)。
