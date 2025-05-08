---
source-updated-at: '2024-08-21T11:18:15.000Z'
translation-updated-at: '2025-05-08T20:16:26.028Z'
id: devtools
title: 開發工具
---

揮舞你的雙手並歡呼吧，因為 Solid Query 附帶了專用的開發者工具 (devtools)！🥳

當你開始使用 Solid Query 時，你會希望這些開發者工具隨時在手邊。它們能幫助你可視化 Solid Query 的所有內部運作，並可能在緊要關頭為你節省數小時的除錯時間！

## 安裝與導入開發者工具

開發者工具是一個獨立的套件，需要額外安裝：

```bash
npm i @tanstack/solid-query-devtools
```

或

```bash
pnpm add @tanstack/solid-query-devtools
```

或

```bash
yarn add @tanstack/solid-query-devtools
```

或

```bash
bun add @tanstack/solid-query-devtools
```

你可以這樣導入開發者工具：

```tsx
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
```

預設情況下，Solid Query 開發者工具僅在 `isServer === true` 時包含在打包檔案中（[`isServer`](https://github.com/solidjs/solid/blob/a72d393a07b22f9b7496e5eb93712188ccce0d28/packages/solid/web/src/index.ts#L37) 來自 `solid-js/web` 套件），因此你無需擔心在生產環境建置時需要排除它們。

## 浮動模式 (Floating Mode)

浮動模式會將開發者工具作為一個固定的浮動元素掛載到你的應用中，並在螢幕角落提供一個切換按鈕來顯示或隱藏開發者工具。此切換狀態會儲存在 localStorage 中，並在重新載入時記住。

將以下程式碼放在你的 Solid 應用中盡可能高的位置。越接近頁面的根元素，效果越好！

```tsx
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 你的應用程式其餘部分 */}
      <SolidQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 選項

- `initialIsOpen: Boolean`
  - 設為 `true` 可讓開發者工具預設為開啟狀態
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"`
  - 預設為 `bottom-right`
  - Solid Query 標誌按鈕的位置，用於開啟和關閉開發者工具面板
- `position?: "top" | "bottom" | "left" | "right"`
  - 預設為 `bottom`
  - Solid Query 開發者工具面板的位置
- `client?: QueryClient`,
  - 使用此選項可自訂 QueryClient。否則會使用最近上下文中的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`
  - 使用此選項可預先定義一些可在查詢中觸發的錯誤。當從 UI 觸發該錯誤時，初始化器會（針對特定查詢）被調用。它必須回傳一個 Error。
- `styleNonce?: string`
  - 使用此選項可傳遞一個 nonce 給添加到文件頭部的 style 標籤。這在使用內容安全政策 (CSP) nonce 來允許內聯樣式時非常有用。
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發者工具的樣式應用到 DOM 中的 head 標籤。
  - 使用此選項可傳遞一個 shadow DOM 目標給開發者工具，這樣樣式就會在 shadow DOM 內應用，而不是在 light DOM 的 head 標籤內。
