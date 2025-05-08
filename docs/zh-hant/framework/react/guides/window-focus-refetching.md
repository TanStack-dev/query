---
source-updated-at: '2024-05-10T12:03:22.000Z'
translation-updated-at: '2025-05-08T20:20:57.518Z'
id: window-focus-refetching
title: 視窗焦點重新獲取
---

如果使用者離開您的應用程式後返回，且查詢資料已過時，**TanStack Query 會自動在背景為您請求新資料**。您可以使用 `refetchOnWindowFocus` 選項全域或針對單一查詢停用此功能：

#### 全域停用

[//]: # 'Example'

```tsx
//
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 預設值: true
    },
  },
})

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

[//]: # 'Example'

#### 單一查詢停用

[//]: # 'Example2'

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false,
})
```

[//]: # 'Example2'

## 自訂視窗焦點事件

在極少數情況下，您可能需要自行管理觸發 TanStack Query 重新驗證的視窗焦點事件。為此，TanStack Query 提供了 `focusManager.setEventListener` 函式，該函式會提供一個在視窗獲得焦點時應觸發的回呼函式，並允許您設定自己的事件。呼叫 `focusManager.setEventListener` 時，先前設定的處理常式會被移除（在大多數情況下會是預設處理常式），並改用您的新處理常式。例如，以下是預設處理常式：

[//]: # 'Example3'

```tsx
focusManager.setEventListener((handleFocus) => {
  // 監聽 visibilitychange 事件
  if (typeof window !== 'undefined' && window.addEventListener) {
    const visibilitychangeHandler = () => {
      handleFocus(document.visibilityState === 'visible')
    }
    window.addEventListener('visibilitychange', visibilitychangeHandler, false)
    return () => {
      // 確保在設定新處理常式時取消訂閱
      window.removeEventListener('visibilitychange', visibilitychangeHandler)
    }
  }
})
```

[//]: # 'Example3'
[//]: # 'ReactNative'

## 在 React Native 中管理焦點

React Native 並非透過 `window` 的事件監聽器提供焦點資訊，而是透過 [`AppState` 模組](https://reactnative.dev/docs/appstate#app-states) 提供。您可以使用 `AppState` 的 "change" 事件在應用程式狀態變更為 "active" 時觸發更新：

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

## 管理焦點狀態

[//]: # 'Example4'

```tsx
import { focusManager } from '@tanstack/react-query'

// 覆蓋預設的焦點狀態
focusManager.setFocused(true)

// 回退到預設的焦點檢查
focusManager.setFocused(undefined)
```

[//]: # 'Example4'
