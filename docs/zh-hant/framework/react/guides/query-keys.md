---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:22:04.442Z'
id: query-keys
title: 查詢鍵
---

TanStack Query 的核心是基於查詢鍵 (query keys) 來為你管理查詢快取。查詢鍵在頂層必須是一個陣列 (Array)，可以簡單到只包含單一字串的陣列，也可以複雜到包含多個字串和巢狀物件。只要查詢鍵是可序列化的 (serializable)，並且**對查詢資料具有唯一性**，你就可以使用它！

## 簡單查詢鍵

最簡單的鍵形式是由常數值組成的陣列。這種格式適用於：

- 通用列表/索引資源
- 非階層式資源

[//]: # 'Example'

```tsx
// 待辦事項列表
useQuery({ queryKey: ['todos'], ... })

// 其他任何東西！
useQuery({ queryKey: ['something', 'special'], ... })
```

[//]: # 'Example'

## 包含變數的陣列鍵

當查詢需要更多資訊來唯一描述其資料時，你可以使用包含字串和任意數量的可序列化物件的陣列。這適用於：

- 階層式或巢狀資源
  - 通常會傳遞 ID、索引或其他基本型別來唯一識別項目
- 帶有額外參數的查詢
  - 通常會傳遞包含額外選項的物件

[//]: # 'Example2'

```tsx
// 單一待辦事項
useQuery({ queryKey: ['todo', 5], ... })

// 以「預覽」格式顯示的單一待辦事項
useQuery({ queryKey: ['todo', 5, { preview: true }], ...})

// 已完成待辦事項列表
useQuery({ queryKey: ['todos', { type: 'done' }], ... })
```

[//]: # 'Example2'

## 查詢鍵會以確定性方式雜湊！

這意味著無論物件中鍵的順序如何，以下所有查詢都被視為相等：

[//]: # 'Example3'

```tsx
useQuery({ queryKey: ['todos', { status, page }], ... })
useQuery({ queryKey: ['todos', { page, status }], ...})
useQuery({ queryKey: ['todos', { page, status, other: undefined }], ... })
```

[//]: # 'Example3'

然而，以下查詢鍵並不相容。陣列項目的順序很重要！

[//]: # 'Example4'

```tsx
useQuery({ queryKey: ['todos', status, page], ... })
useQuery({ queryKey: ['todos', page, status], ...})
useQuery({ queryKey: ['todos', undefined, page, status], ...})
```

[//]: # 'Example4'

## 若查詢函式依賴於變數，請將其包含在查詢鍵中

由於查詢鍵唯一描述了它們所獲取的資料，因此應包含查詢函式中使用的任何**會變化**的變數。例如：

[//]: # 'Example5'

```tsx
function Todos({ todoId }) {
  const result = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetchTodoById(todoId),
  })
}
```

[//]: # 'Example5'

請注意，查詢鍵會作為查詢函式的依賴項。將依賴變數加入查詢鍵可確保查詢被獨立快取，並且每當變數改變時，_查詢會自動重新獲取_（取決於你的 `staleTime` 設定）。更多資訊和範例請參閱 [exhaustive-deps](../../../eslint/exhaustive-deps.md) 章節。

[//]: # 'Materials'

## 延伸閱讀

若想了解在大型應用中組織查詢鍵的技巧，請參考 [Effective React Query Keys](../community/tkdodos-blog.md#8-effective-react-query-keys)，並查看社群資源中的 [Query Key Factory Package](../community/community-projects.md#query-key-factory)。

[//]: # 'Materials'
