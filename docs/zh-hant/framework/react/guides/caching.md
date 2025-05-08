---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:24:39.360Z'
id: caching
title: 快取
---

> 請在閱讀本指南前，先詳閱 [重要預設值](./important-defaults.md)

## 基礎範例

這個快取範例將說明以下情境的生命週期：

- 有無快取資料的查詢實例 (Query Instances)
- 背景重新獲取 (Background Refetching)
- 非活躍查詢 (Inactive Queries)
- 垃圾回收機制 (Garbage Collection)

假設我們使用預設的 `gcTime` 值為 **5 分鐘**，且預設 `staleTime` 為 `0`。

- 當一個新的 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例掛載時：
  - 由於之前沒有使用 `['todos']` 查詢鍵 (query key) 進行過其他查詢，該查詢會顯示硬載入狀態 (hard loading state) 並發起網路請求以獲取資料。
  - 當網路請求完成時，返回的資料會被快取在 `['todos']` 鍵下。
  - 該掛鉤 (hook) 會根據設定的 `staleTime`（預設為 `0`，即立即）將資料標記為過時 (stale)。
- 當第二個 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例在其他地方掛載時：
  - 由於快取中已有來自第一個查詢的 `['todos']` 鍵資料，該資料會立即從快取中返回。
  - 新實例會使用其查詢函數觸發一個新的網路請求。
    - 請注意，無論兩個 `fetchTodos` 查詢函數是否相同，兩個查詢的 [`status`](../reference/useQuery.md)（包括 `isFetching`、`isPending` 和其他相關值）都會更新，因為它們擁有相同的查詢鍵。
  - 當請求成功完成時，快取中 `['todos']` 鍵下的資料會更新為新資料，且兩個實例都會同步更新為新資料。
- 當兩個 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例卸載並不再使用時：
  - 由於該查詢已無活躍實例，系統會根據 `gcTime` 設定一個垃圾回收超時（預設為 **5 分鐘**）來刪除並回收該查詢。
- 在快取超時完成前，另一個 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例掛載：
  - 查詢會立即返回可用的快取資料，同時在背景執行 `fetchTodos` 函數。當成功完成時，會用新資料更新快取。
- 最後一個 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例卸載。
- 在 **5 分鐘** 內沒有再出現任何 `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` 實例：
  - `['todos']` 鍵下的快取資料會被刪除並進行垃圾回收。
