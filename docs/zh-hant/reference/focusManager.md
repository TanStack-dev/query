---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-08T20:14:50.524Z'
id: FocusManager
title: focusManager
---

`FocusManager` 負責管理 TanStack Query 中的焦點狀態。

它可用於變更預設的事件監聽器或手動調整焦點狀態。

其提供的方法如下：

- [`setEventListener`](#focusmanagerseteventlistener)
- [`subscribe`](#focusmanagersubscribe)
- [`setFocused`](#focusmanagersetfocused)
- [`isFocused`](#focusmanagerisfocused)

## `focusManager.setEventListener`

`setEventListener` 可用於設定自訂事件監聽器：

```tsx
import { focusManager } from '@tanstack/react-query'

focusManager.setEventListener((handleFocus) => {
  // 監聽 visibilitychange 事件
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('visibilitychange', handleFocus, false)
  }

  return () => {
    // 若設定新的處理函式，務必取消訂閱
    window.removeEventListener('visibilitychange', handleFocus)
  }
})
```

## `focusManager.subscribe`

`subscribe` 可用於訂閱可見度狀態的變更。它會回傳一個取消訂閱的函式：

```tsx
import { focusManager } from '@tanstack/react-query'

const unsubscribe = focusManager.subscribe((isVisible) => {
  console.log('isVisible', isVisible)
})
```

## `focusManager.setFocused`

`setFocused` 可用於手動設定焦點狀態。設定為 `undefined` 可回歸預設的焦點檢查機制。

```tsx
import { focusManager } from '@tanstack/react-query'

// 設定為聚焦狀態
focusManager.setFocused(true)

// 設定為非聚焦狀態
focusManager.setFocused(false)

// 回歸預設的焦點檢查
focusManager.setFocused(undefined)
```

**選項**

- `focused: boolean | undefined`

## `focusManager.isFocused`

`isFocused` 可用於取得當前的焦點狀態。

```tsx
const isFocused = focusManager.isFocused()
```
