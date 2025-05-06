---
source-updated-at: '2025-02-12T15:01:46.000Z'
translation-updated-at: '2025-05-06T04:25:35.500Z'
id: react-native
title: React Native
---
React Query 设计上可直接在 React Native 中开箱使用，但目前开发工具（devtools）仅支持 React DOM。

您可以尝试以下第三方插件：
- [Expo](https://docs.expo.dev/) 插件：https://github.com/expo/dev-plugins/tree/main/packages/react-query  
- [Flipper](https://fbflipper.com/docs/getting-started/react-native/) 插件：https://github.com/bgaleotti/react-query-native-devtools  
- [Reactotron](https://github.com/infinitered/reactotron/) 插件：https://github.com/hsndmr/reactotron-react-query  

若您愿意协助我们开发跨平台的内置开发工具，欢迎随时联系！

## 在线状态管理

React Query 已支持浏览器断网重连后自动重新请求数据。在 React Native 中实现该功能需使用 `onlineManager`，示例如下：

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

## 应用聚焦时重新请求

不同于浏览器监听 `window` 事件，React Native 通过 [`AppState` 模块](https://reactnative.dev/docs/appstate#app-states) 提供应用状态信息。可利用 "change" 事件在应用状态变为 "active" 时触发更新：

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

## 屏幕聚焦时刷新

某些场景下，您可能需要在 React Native 屏幕重新聚焦时重新请求数据。以下自定义钩子会在屏幕聚焦时调用传入的 `refetch` 方法：

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

上述代码中首次加载会跳过 `refetch`，因为 `useFocusEffect` 在组件挂载时也会触发回调。

## 禁用非聚焦屏幕的查询

若您不希望某些查询在屏幕失焦时保持活跃状态，可通过 `useQuery` 的 `subscribed` 属性控制查询是否持续订阅更新。结合 React Navigation 的 `useIsFocused`，可实现屏幕失焦时自动取消订阅：

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

当 `subscribed` 为 `false` 时，查询将取消订阅更新，既不会触发重渲染也不会为该屏幕获取新数据。当值恢复为 `true`（例如屏幕重新聚焦时），查询会重新订阅并保持数据最新。
