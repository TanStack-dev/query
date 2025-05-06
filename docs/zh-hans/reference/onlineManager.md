---
source-updated-at: '2024-01-26T08:30:21.000Z'
translation-updated-at: '2025-05-06T03:52:00.643Z'
id: OnlineManager
title: onlineManager
---

`OnlineManager` 负责管理 TanStack Query 中的在线状态。它可用于修改默认的事件监听器或手动更改在线状态。

> 默认情况下，`onlineManager` 会假定存在活跃的网络连接，并通过监听 `window` 对象上的 `online` 和 `offline` 事件来检测状态变化。

> 在早期版本中，系统使用 `navigator.onLine` 判断网络状态。但该方法在基于 Chromium 的浏览器中存在缺陷，[大量问题](https://bugs.chromium.org/p/chromium/issues/list?q=navigator.online)表明其会产生误报，导致查询被错误标记为 `offline`。

> 为解决此问题，现在我们会始终以 `online: true` 作为初始状态，仅通过监听 `online` 和 `offline` 事件来更新状态。

> 这种方式能降低误报概率，但对于通过 Service Worker 加载的离线应用可能会产生误判，因为这类应用即使没有网络连接也能正常运行。

提供的方法包括：

- [`setEventListener`](#onlinemanagerseteventlistener)
- [`subscribe`](#onlinemanagersubscribe)
- [`setOnline`](#onlinemanagersetonline)
- [`isOnline`](#onlinemanagerisonline)

## `onlineManager.setEventListener`

`setEventListener` 可用于设置自定义事件监听器：

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

`subscribe` 可用于订阅在线状态变化。该方法会返回取消订阅的函数：

```tsx
import { onlineManager } from '@tanstack/react-query'

const unsubscribe = onlineManager.subscribe((isOnline) => {
  console.log('isOnline', isOnline)
})
```

## `onlineManager.setOnline`

`setOnline` 可用于手动设置在线状态：

```tsx
import { onlineManager } from '@tanstack/react-query'

// 设置为在线
onlineManager.setOnline(true)

// 设置为离线
onlineManager.setOnline(false)
```

**配置项**

- `online: boolean`

## `onlineManager.isOnline`

`isOnline` 可用于获取当前在线状态：

```tsx
const isOnline = onlineManager.isOnline()
```
