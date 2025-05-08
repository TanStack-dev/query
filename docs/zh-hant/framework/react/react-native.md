---
source-updated-at: '2025-02-12T15:01:46.000Z'
translation-updated-at: '2025-05-08T20:16:49.312Z'
id: react-native
title: React Native
---

React Query 設計上能直接與 React Native 無縫協作，但目前開發者工具 (devtools) 僅支援 React DOM。

你可以嘗試以下第三方套件：

- [Expo](https://docs.expo.dev/) 插件：https://github.com/expo/dev-plugins/tree/main/packages/react-query
- [Flipper](https://fbflipper.com/docs/getting-started/react-native/) 插件：https://github.com/bgaleotti/react-query-native-devtools
- [Reactotron](https://github.com/infinitered/reactotron/) 插件：https://github.com/hsndmr/reactotron-react-query

若您願意協助我們讓內建開發者工具跨平台通用，歡迎聯繫我們！

## 線上狀態管理

React Query 在網頁瀏覽器中已支援自動重新連線時重新擷取 (auto refetch on reconnect)。要在 React Native 實現此行為，需使用 React Query 的 `onlineManager`，如下範例：

```tsx
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})
```

或

```tsx
import { onlineManager } from '@tanstack/react-query'
import * as Network from 'expo-network'

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected)
  })
  return eventSubscription.remove
})
```

## 應用程式焦點時重新擷取

React Native 透過 [`AppState` 模組](https://reactnative.dev/docs/appstate#app-states)提供焦點狀態資訊（而非網頁的 `window` 事件監聽器）。您可以使用 `AppState` 的 "change" 事件在應用狀態變為 "active" 時觸發更新：

```tsx
import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import type { AppStateStatus } from 'react-native'
import { focusManager } from '@tanstack/react-query'

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

useEffect(() => {
  const subscription = AppState.addEventListener('change', onAppStateChange)

  return () => subscription.remove()
}, [])
```

## 畫面焦點時重新整理

某些情境下，您可能希望在 React Native 畫面重新獲得焦點時重新擷取查詢。以下自訂勾子 (custom hook) 會在畫面再次聚焦時呼叫傳入的 `refetch` 函式：

```tsx
import React from 'react'
import { useFocusEffect } from '@react-navigation/native'

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = React.useRef(true)

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false
        return
      }

      refetch()
    }, [refetch]),
  )
}
```

上述程式碼會跳過首次執行，因為 `useFocusEffect` 除了在畫面聚焦時，也會在元件掛載時呼叫回調函式。

## 停用非焦點畫面的查詢

若您不希望特定查詢在畫面失去焦點時保持「活動」狀態，可使用 `useQuery` 的 `subscribed` 屬性。此屬性讓您控制查詢是否持續訂閱更新，搭配 React Navigation 的 `useIsFocused` 即可在畫面非焦點時自動取消訂閱：

使用範例：

```tsx
import React from 'react'
import { useIsFocused } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Text } from 'react-native'

function MyComponent() {
  const isFocused = useIsFocused()

  const { dataUpdatedAt } = useQuery({
    queryKey: ['key'],
    queryFn: () => fetch(...),
    subscribed: isFocused,
  })

  return <Text>DataUpdatedAt: {dataUpdatedAt}</Text>
}
```

當 `subscribed` 設為 `false` 時，查詢會取消訂閱更新，不會觸發重新渲染或為該畫面擷取新資料。當值再次變為 `true`（例如畫面重新獲得焦點時），查詢會重新訂閱並保持資料最新狀態。
