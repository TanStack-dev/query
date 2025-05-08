---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:23:05.538Z'
id: network-mode
title: 網路模式
---

TanStack Query 提供了三種不同的網路模式，用於區分當沒有網路連線時 [查詢 (Queries)](./queries.md) 和 [變更 (Mutations)](./mutations.md) 應如何運作。此模式可以針對每個查詢/變更單獨設定，或透過查詢/變更的預設值全域設定。

由於 TanStack Query 最常與資料獲取函式庫搭配使用於資料獲取情境，預設的網路模式是 [線上模式 (online)](#network-mode-online)。

## 網路模式：線上模式 (online)

在此模式下，除非有網路連線，否則查詢與變更將不會執行。這是預設模式。若因無網路連線導致查詢的獲取 (fetch) 無法執行，該查詢將始終保持其當前的 `狀態` (`pending`, `error`, `success`)。不過，系統會額外提供一個 [獲取狀態 (fetchStatus)](./queries.md#fetchstatus)，其可能值為：

- `fetching`: `queryFn` 正在實際執行中 — 請求正在傳輸中。
- `paused`: 查詢未執行 — 它會處於 `暫停 (paused)` 狀態直到重新取得連線。
- `idle`: 查詢既未獲取也未暫停。

為方便起見，系統會從此狀態衍生出 `isFetching` 和 `isPaused` 標記並公開。

> 請注意，僅檢查 `pending` 狀態可能不足以顯示載入動畫。若查詢首次掛載且無網路連線，它們可能處於 `state: 'pending'` 但 `fetchStatus: 'paused'` 的狀態。

若查詢因連線狀態正常而執行，但在獲取過程中斷線，TanStack Query 也會暫停重試機制。暫停的查詢將在重新取得網路連線後繼續執行。此行為與 `refetchOnReconnect` (在此模式下也預設為 `true`) 無關，因為這不是 `重新獲取 (refetch)`，而是 `繼續 (continue)`。若查詢在此期間已被 [取消 (cancelled)](./query-cancellation.md)，則不會繼續執行。

## 網路模式：總是執行 (always)

在此模式下，TanStack Query 會忽略線上/離線狀態並始終執行獲取。若您在不需要主動網路連線即可讓查詢運作的環境中使用 TanStack Query (例如僅從 `AsyncStorage` 讀取，或僅想從 `queryFn` 回傳 `Promise.resolve(5)`)，此模式可能是您想選擇的。

- 查詢絕不會因無網路連線而 `暫停 (paused)`。
- 重試也不會暫停 — 若失敗，查詢將進入 `error` 狀態。
- 在此模式下，`refetchOnReconnect` 預設為 `false`，因為重新連線至網路不再代表應重新獲取過時查詢。您仍可手動啟用此選項。

## 網路模式：離線優先 (offlineFirst)

此模式是前兩種選項的折衷方案，TanStack Query 會執行 `queryFn` 一次，但之後會暫停重試。這對於使用 [離線優先 PWA (offline-first PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers) 中攔截請求以進行快取的 Service Worker，或透過 [Cache-Control 標頭 (Cache-Control header)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#the_cache-control_header) 使用 HTTP 快取的情境非常實用。

在此類情境中，首次獲取可能因來自離線儲存/快取而成功。但若發生快取未命中 (cache miss)，網路請求將發出並失敗，此時此模式的行為會類似 `online` 查詢 — 暫停重試。

## 開發者工具 (Devtools)

[TanStack Query 開發者工具 (Devtools)](../devtools.md) 會顯示處於 `暫停 (paused)` 狀態的查詢 — 若它們本應獲取但無網路連線。工具中也提供一個 _模擬離線行為_ 的切換按鈕。請注意，此按鈕並不會實際干擾您的網路連線 (您可以在瀏覽器開發者工具中執行此操作)，而是會將 [OnlineManager](../../../reference/onlineManager.md) 設定為離線狀態。

## 簽名 (Signature)

- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - 選填
  - 預設為 `'online'`
