---
source-updated-at: '2024-11-04T06:38:47.000Z'
translation-updated-at: '2025-05-08T20:18:01.444Z'
id: devtools
title: 開發工具
---

舉起雙手歡呼吧，因為 React Query 附帶了專用的開發者工具 (DevTools)！ 🥳

當你開始使用 React Query 時，這些開發者工具將成為你的得力助手。它們能可視化 React Query 的所有內部運作，當你遇到棘手問題時，很可能為你節省數小時的除錯時間！

> 請注意，目前開發者工具 **不支援 React Native**。如果你願意協助我們讓開發者工具跨平台通用，請告訴我們！

> 好消息：我們現在為 React Native 提供了獨立的 React Query 開發者工具套件！這個新功能帶來了原生支援，讓你能直接將開發者工具整合到 React Native 專案中。查看並貢獻於此：[react-native-react-query-devtools](https://github.com/LovesWorking/react-native-react-query-devtools)

> 另有一個外部工具可透過外部儀表板使用 React Query 開發者工具。詳情與貢獻請見：[react-query-external-sync](https://github.com/LovesWorking/react-query-external-sync)

> 注意：自第 5 版起，開發者工具也支援觀察變異 (mutations)。

## 安裝與導入開發者工具

開發者工具是一個獨立的套件，需另行安裝：

```bash
npm i @tanstack/react-query-devtools
```

或

```bash
pnpm add @tanstack/react-query-devtools
```

或

```bash
yarn add @tanstack/react-query-devtools
```

或

```bash
bun add @tanstack/react-query-devtools
```

對於 Next 13+ 的 App 目錄，必須將其安裝為開發依賴 (dev dependency) 才能運作。

導入開發者工具的方式如下：

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
```

預設情況下，React Query 開發者工具僅在 `process.env.NODE_ENV === 'development'` 時包含在打包檔案中，因此無需擔心在生產環境建置時需排除它們。

## 浮動模式 (Floating Mode)

浮動模式會將開發者工具作為一個固定的浮動元素掛載到你的應用中，並在畫面角落提供一個切換按鈕來顯示或隱藏開發者工具。此切換狀態會儲存在 localStorage 中，並在重新載入時記住。

將以下程式碼放在 React 應用的最上層，越靠近頁面根目錄效果越好！

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 應用程式的其餘部分 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 選項

- `initialIsOpen: Boolean`
  - 設為 `true` 可讓開發者工具預設為開啟狀態
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 預設為 `bottom-right`
  - 設定 React Query 標誌按鈕的位置以開啟和關閉開發者工具面板
  - 若設為 `relative`，按鈕會放在你渲染開發者工具的位置。
- `position?: "top" | "bottom" | "left" | "right"`
  - 預設為 `bottom`
  - 設定 React Query 開發者工具面板的位置
- `client?: QueryClient`,
  - 使用此選項可自訂 QueryClient，否則會使用最近上下文中的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 用於預定義可在查詢中觸發的錯誤。當從 UI 切換該錯誤時，初始化器（帶有特定查詢）會被呼叫。它必須回傳一個錯誤。
- `styleNonce?: string`
  - 用於傳遞 nonce 給添加到文件頭的 style 標籤。這在使用內容安全策略 (CSP) nonce 允許內聯樣式時很有用。
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發者工具的樣式應用到 DOM 中的 head 標籤。
  - 使用此選項可傳遞 shadow DOM 目標給開發者工具，讓樣式在 shadow DOM 中生效，而非在 light DOM 的 head 標籤中。

## 嵌入模式 (Embedded Mode)

嵌入模式會將開發者工具作為固定元素顯示在你的應用中，讓你能在自己的開發工具中使用我們的面板。

將以下程式碼放在 React 應用的最上層，越靠近頁面根目錄效果越好！

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

function App() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      {/* 應用程式的其餘部分 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
      >{`${isOpen ? '關閉' : '開啟'} 開發者工具面板`}</button>
      {isOpen && <ReactQueryDevtoolsPanel onClose={() => setIsOpen(false)} />}
    </QueryClientProvider>
  )
}
```

### 選項

- `style?: React.CSSProperties`
  - 開發者工具面板的自訂樣式
  - 預設：`{ height: '500px' }`
  - 範例：`{ height: '100%' }`
  - 範例：`{ height: '100%', width: '100%' }`
- `onClose?: () => unknown`
  - 開發者工具面板關閉時呼叫的回呼函式
- `client?: QueryClient`,
  - 使用此選項可自訂 QueryClient，否則會使用最近上下文中的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 用於預定義可在查詢中觸發的錯誤。當從 UI 切換該錯誤時，初始化器（帶有特定查詢）會被呼叫。它必須回傳一個錯誤。
- `styleNonce?: string`
  - 用於傳遞 nonce 給添加到文件頭的 style 標籤。這在使用內容安全策略 (CSP) nonce 允許內聯樣式時很有用。
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發者工具的樣式應用到 DOM 中的 head 標籤。
  - 使用此選項可傳遞 shadow DOM 目標給開發者工具，讓樣式在 shadow DOM 中生效，而非在 light DOM 的 head 標籤中。

## 生產環境中的開發者工具

開發者工具在生產環境建置中會被排除。然而，你可能希望在生產環境中懶加載 (lazy load) 開發者工具：

```tsx
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Example } from './Example'

const queryClient = new QueryClient()

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
)

function App() {
  const [showDevtools, setShowDevtools] = React.useState(false)

  React.useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <ReactQueryDevtools initialIsOpen />
      {showDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </QueryClientProvider>
  )
}

export default App
```

如此一來，呼叫 `window.toggleDevtools()` 就會下載開發者工具套件並顯示它們。

### 現代打包工具

如果你的打包工具支援套件匯出 (package exports)，可以使用以下導入路徑：

```tsx
const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
)
```

對於 TypeScript，你需要在 tsconfig 中設定 `moduleResolution: 'nodenext'`，這至少需要 TypeScript v4.7。
