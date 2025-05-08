---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-08T20:14:58.463Z'
id: OnlineManager
title: onlineManager
---

`OnlineManager` 負責管理 TanStack Query 中的線上狀態。它可用於變更預設的事件監聽器或手動調整線上狀態。

> 預設情況下，`onlineManager` 會假設網路連線為活動狀態，並透過監聽 `window` 物件上的 `online` 和 `offline` 事件來偵測狀態變化。

> 在舊版中，系統使用 `navigator.onLine` 來判斷網路狀態。但此方法在基於 Chromium 的瀏覽器中運作不佳。[許多問題](https://bugs.chromium.org/p/chromium/issues/list?q=navigator.online) 會導致誤判為離線狀態，進而錯誤地將查詢標記為 `offline`。

> 為解決此問題，現在我們會始終以 `online: true` 作為初始狀態，僅透過監聽 `online` 和 `offline` 事件來更新狀態。

> 這應能降低誤判為離線的機率，但對於透過 serviceWorker 載入的離線應用程式，可能會出現誤判為在線的情況，因為這類應用即使沒有網路連線仍可運作。

可用的方法包括：

- [`setEventListener`](#onlinemanagerseteventlistener)
- [`subscribe`](#onlinemanagersubscribe)
- [`setOnline`](#onlinemanagersetonline)
- [`isOnline`](#onlinemanagerisonline)

## `onlineManager.setEventListener`

`setEventListener` 可用於設定自訂事件監聽器：

```tsx
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})
```

## `onlineManager.subscribe`

`subscribe` 可用於訂閱線上狀態的變更。它會回傳一個取消訂閱的函式：

```tsx
import { onlineManager } from '@tanstack/react-query'

const unsubscribe = onlineManager.subscribe((isOnline) => {
  console.log('isOnline', isOnline)
})
```

## `onlineManager.setOnline`

`setOnline` 可用於手動設定線上狀態。

```tsx
import { onlineManager } from '@tanstack/react-query'

// 設定為線上
onlineManager.setOnline(true)

// 設定為離線
onlineManager.setOnline(false)
```

**選項**

- `online: boolean`

## `onlineManager.isOnline`

`isOnline` 可用於取得當前的線上狀態。

```tsx
const isOnline = onlineManager.isOnline()
```
