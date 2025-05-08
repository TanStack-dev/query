---
source-updated-at: '2025-04-13T18:21:31.000Z'
translation-updated-at: '2025-05-08T20:26:12.104Z'
id: caching
title: 快取
---

> 請在閱讀本指南前，先詳細閱讀[重要預設值](./important-defaults.md)

## 基礎範例

這個快取範例說明了以下情境的生命週期：

- 有無快取資料的查詢實例 (Query Instances)
- 背景重新獲取 (Background Refetching)
- 非活躍查詢 (Inactive Queries)
- 垃圾回收機制 (Garbage Collection)

假設我們使用預設的 `gcTime` 值 **5 分鐘** 和預設的 `staleTime` 值 `0`。

- 當一個新的 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos }))` 實例初始化時：
  - 由於尚未有其他使用 `['todos']` 查詢鍵 (query key) 的查詢，此查詢會顯示硬載入狀態 (hard loading state) 並發起網路請求以獲取資料。
  - 當網路請求完成時，返回的資料會被快取在 `['todos']` 鍵值下。
  - 資料會根據設定的 `staleTime`（預設為 `0`，即立即）標記為過時 (stale)。
- 當第二個 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 實例在其他地方初始化時：
  - 由於快取中已有來自第一個查詢的 `['todos']` 鍵值資料，該資料會立即從快取中返回。
  - 新實例會使用其查詢函數觸發新的網路請求。
    - 請注意，無論兩個 `fetchTodos` 查詢函數是否相同，兩個查詢的 [`status`](../../reference/injectQuery.md)（包括 `isFetching`、`isPending` 和其他相關值）都會更新，因為它們具有相同的查詢鍵。
  - 當請求成功完成時，快取中 `['todos']` 鍵值的資料會更新為新資料，兩個實例也會同步更新為新資料。
- 當兩個 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 查詢實例都被銷毀且不再使用時：
  - 由於該查詢已無活躍實例，系統會根據 `gcTime` 設定一個垃圾回收超時（預設為 **5 分鐘**）來刪除並回收該查詢。
- 在快取超時完成前，另一個 `injectQuery(() => ({ queryKey: ['todos'], queyFn: fetchTodos })` 實例掛載。該查詢會立即返回可用的快取資料，同時在背景執行 `fetchTodos` 函數。當背景請求成功完成時，會用新資料更新快取。
- 最後一個 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 實例被銷毀。
- 在 **5 分鐘** 內沒有再出現任何 `injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchTodos })` 實例：
  - `['todos']` 鍵值下的快取資料會被刪除並進行垃圾回收。
