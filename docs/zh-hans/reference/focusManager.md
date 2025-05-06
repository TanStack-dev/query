---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-06T03:52:22.525Z'
id: FocusManager
title: focusManager
---

`FocusManager` 用于管理 TanStack Query 中的焦点状态。

它可用于更改默认的事件监听器或手动修改焦点状态。

其提供的方法包括：

- [`setEventListener`](#focusmanagerseteventlistener)
- [`subscribe`](#focusmanagersubscribe)
- [`setFocused`](#focusmanagersetfocused)
- [`isFocused`](#focusmanagerisfocused)

## `focusManager.setEventListener`

`setEventListener` 可用于设置自定义事件监听器：

```tsx
import { focusManager } from '@tanstack/react-query'

focusManager.setEventListener((handleFocus) => {
  // 监听 visibilitychange 事件
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('visibilitychange', handleFocus, false)
  }

  return () => {
    // 设置新监听器时务必取消订阅
    window.removeEventListener('visibilitychange', handleFocus)
  }
})
```

## `focusManager.subscribe`

`subscribe` 可用于订阅可见性状态的变化。它返回一个取消订阅的函数：

```tsx
import { focusManager } from '@tanstack/react-query'

const unsubscribe = focusManager.subscribe((isVisible) => {
  console.log('isVisible', isVisible)
})
```

## `focusManager.setFocused`

`setFocused` 可用于手动设置焦点状态。设为 `undefined` 可回退至默认的焦点检查逻辑。

```tsx
import { focusManager } from '@tanstack/react-query'

// 设为聚焦状态
focusManager.setFocused(true)

// 设为非聚焦状态
focusManager.setFocused(false)

// 回退至默认焦点检查
focusManager.setFocused(undefined)
```

**选项**

- `focused: boolean | undefined`

## `focusManager.isFocused`

`isFocused` 可用于获取当前焦点状态。

```tsx
const isFocused = focusManager.isFocused()
```
