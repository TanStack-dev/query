---
source-updated-at: '2024-08-21T11:18:15.000Z'
translation-updated-at: '2025-05-08T20:16:05.337Z'
id: devtools
title: 開發工具
---

舉起雙手歡呼吧，因為 Vue Query 附帶專用的開發者工具 (devtools)！ 🥳

當你開始使用 Vue Query 時，你會希望這些開發者工具伴隨左右。它們能幫助你可視化 Vue Query 的所有內部運作，並在你陷入困境時節省數小時的除錯時間！

## 基於元件的開發者工具 (Vue 3)

你可以使用專用套件直接將開發者工具元件整合到頁面中。  
基於元件的開發者工具採用與框架無關的實作，並始終保持最新狀態。

開發者工具元件是一個獨立的套件，需要先安裝：

```bash
npm i @tanstack/vue-query-devtools
```

或

```bash
pnpm add @tanstack/vue-query-devtools
```

或

```bash
yarn add @tanstack/vue-query-devtools
```

或

```bash
bun add @tanstack/vue-query-devtools
```

預設情況下，Vue Query 開發者工具僅在 `process.env.NODE_ENV === 'development'` 時包含在套件中，因此你無需擔心在生產環境建置時排除它們。

開發者工具會以固定浮動元素的形式掛載到你的應用程式中，並在畫面角落提供一個切換按鈕來顯示或隱藏開發者工具。此切換狀態會儲存在 localStorage 中，並在重新載入時記住。

將以下程式碼放在 Vue 應用程式中盡可能高的位置。越接近頁面根目錄，效果越好！

```vue
<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <h1>The app!</h1>
  <VueQueryDevtools />
</template>
```

### 選項

- `initialIsOpen: Boolean`
  - 設為 `true` 可讓開發者工具預設為開啟狀態。
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"`
  - 預設為 `bottom-right`。
  - 用於設定開啟和關閉開發者工具面板的 React Query 標誌位置。
- `position?: "top" | "bottom" | "left" | "right"`
  - 預設為 `bottom`。
  - 用於設定 React Query 開發者工具面板的位置。
- `client?: QueryClient`
  - 使用此選項可自訂 QueryClient。否則會使用最近上下文中的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`
  - 使用此選項可預定義一些能在查詢中觸發的錯誤。當從 UI 切換該錯誤時，初始化器會呼叫（傳入特定查詢）。它必須回傳一個 Error。
- `styleNonce?: string`
  - 使用此選項可傳遞 nonce 給新增到文件 head 的 style 標籤。這在使用內容安全策略 (CSP) nonce 允許內聯樣式時很有用。
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發者工具的樣式套用到 DOM 中的 head 標籤。
  - 使用此選項可傳遞 shadow DOM 目標給開發者工具，讓樣式套用在 shadow DOM 中，而非 light DOM 的 head 標籤內。

## 傳統開發者工具

Vue Query 將無縫整合 [官方 Vue 開發者工具](https://github.com/vuejs/devtools-next)，新增自訂檢查器和時間軸事件。  
開發者工具的程式碼預設會從生產環境套件中被 Tree Shaking 移除。

要使其運作，你只需在插件選項中啟用：

```ts
app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
})
```

同時支援 v6 和 v7 版本的開發者工具。
