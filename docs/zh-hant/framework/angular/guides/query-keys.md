---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:25:06.592Z'
id: query-keys
title: 查詢鍵
---

從核心來看，TanStack Query 會根據查詢鍵 (query keys) 為你管理查詢快取 (query caching)。查詢鍵在頂層必須是一個陣列 (Array)，可以簡單到只包含單一字串的陣列，也可以複雜到包含多個字串和巢狀物件。只要查詢鍵是可序列化 (serializable) 的，並且**對查詢資料具有唯一性**，你就可以使用它！

## 簡單的查詢鍵

最簡單的鍵形式是由常數值組成的陣列。這種格式適用於：

- 通用列表/索引資源 (Generic List/Index resources)
- 非階層式資源 (Non-hierarchical resources)

```ts
// 待辦事項列表
injectQuery(() => ({ queryKey: ['todos'], ... }))

// 其他任何東西！
injectQuery(() => ({ queryKey: ['something', 'special'], ... }))
```

## 帶有變數的陣列鍵

當查詢需要更多資訊來唯一描述其資料時，你可以使用包含字串和任意數量可序列化物件的陣列來描述。這適用於：

- 階層式或巢狀資源 (Hierarchical or nested resources)
  - 通常會傳遞 ID、索引或其他基本類型來唯一識別項目
- 帶有附加參數的查詢
  - 通常會傳遞包含附加選項的物件

```ts
// 單個待辦事項
injectQuery(() => ({queryKey: ['todo', 5], ...}))

// 以「預覽」格式顯示的單個待辦事項
injectQuery(() => ({queryKey: ['todo', 5, {preview: true}], ...}))

// 標記為「完成」的待辦事項列表
injectQuery(() => ({queryKey: ['todos', {type: 'done'}], ...}))
```

## 查詢鍵會以確定性方式進行雜湊處理！

這意味著無論物件中鍵的順序如何，以下所有查詢都被視為相等：

```ts
injectQuery(() => ({ queryKey: ['todos', { status, page }], ... }))
injectQuery(() => ({ queryKey: ['todos', { page, status }], ...}))
injectQuery(() => ({ queryKey: ['todos', { page, status, other: undefined }], ... }))
```

然而，以下查詢鍵並不相等的。陣列項目的順序很重要！

```ts
injectQuery(() => ({ queryKey: ['todos', status, page], ... }))
injectQuery(() => ({ queryKey: ['todos', page, status], ...}))
injectQuery(() => ({ queryKey: ['todos', undefined, page, status], ...}))
```

## 如果你的查詢函式依賴於變數，請將其包含在查詢鍵中

由於查詢鍵唯一描述了它們正在獲取的資料，因此應該包含你在查詢函式中使用的任何**會變化**的變數。例如：

```ts
todoId = signal(-1)

injectQuery(() => ({
  enabled: todoId() > 0,
  queryKey: ['todos', todoId()],
  queryFn: () => fetchTodoById(todoId()),
}))
```

請注意，查詢鍵會作為查詢函式的依賴項。將依賴變數添加到查詢鍵中，可以確保查詢被獨立快取，並且每當變數變化時，_查詢會自動重新獲取_（取決於你的 `staleTime` 設定）。更多資訊和範例請參閱 [exhaustive-deps](../../../eslint/exhaustive-deps.md) 章節。
