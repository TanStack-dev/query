---
source-updated-at: '2024-05-10T12:03:22.000Z'
translation-updated-at: '2025-05-06T04:02:39.658Z'
id: window-focus-refetching
title: 窗口焦点重新获取
---
如果用户离开应用后返回，且查询数据已过时，**TanStack Query 会自动在后台为你请求最新数据**。你可以通过 `refetchOnWindowFocus` 选项全局或按查询禁用此行为：

#### 全局禁用

[//]: # 'Example'

```tsx
//
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 默认值: true
    },
  },
})

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

[//]: # 'Example'

#### 按查询禁用

[//]: # 'Example2'

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false,
})
```

[//]: # 'Example2'

## 自定义窗口聚焦事件

在极少数情况下，你可能希望自行管理触发 TanStack Query 重新验证的窗口聚焦事件。为此，TanStack Query 提供了 `focusManager.setEventListener` 函数，该函数会提供窗口聚焦时应触发的回调，并允许你设置自定义事件。调用 `focusManager.setEventListener` 时，先前设置的事件处理器会被移除（大多数情况下是默认处理器），并替换为你的新处理器。以下是默认处理器的实现示例：

[//]: # 'Example3'

```tsx
focusManager.setEventListener((handleFocus) => {
  // 监听 visibilitychange 事件
  if (typeof window !== 'undefined' && window.addEventListener) {
    const visibilitychangeHandler = () => {
      handleFocus(document.visibilityState === 'visible')
    }
    window.addEventListener('visibilitychange', visibilitychangeHandler, false)
    return () => {
      // 确保在新处理器设置时取消订阅
      window.removeEventListener('visibilitychange', visibilitychangeHandler)
    }
  }
})
```

[//]: # 'Example3'
[//]: # 'ReactNative'

## 在 React Native 中管理聚焦状态

不同于在 `window` 上监听事件，React Native 通过 [`AppState` 模块](https://reactnative.dev/docs/appstate#app-states) 提供聚焦信息。你可以使用 `AppState` 的 "change" 事件在应用状态变为 "active" 时触发更新：

```tsx
import { AppState } from 'react-native'
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

[//]: # 'ReactNative'

## 管理聚焦状态

[//]: # 'Example4'

```tsx
import { focusManager } from '@tanstack/react-query'

// 覆盖默认聚焦状态
focusManager.setFocused(true)

// 回退到默认聚焦检查
focusManager.setFocused(undefined)
```

[//]: # 'Example4'
