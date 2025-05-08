---
source-updated-at: '2025-03-07T10:54:04.000Z'
translation-updated-at: '2025-05-08T20:15:38.291Z'
id: devtools
title: 開發工具
---

## 安裝並導入開發者工具 (Devtools)

開發者工具是一個獨立的套件，需要額外安裝：

```bash
npm i @tanstack/svelte-query-devtools
```

或

```bash
pnpm add @tanstack/svelte-query-devtools
```

或

```bash
yarn add @tanstack/svelte-query-devtools
```

或

```bash
bun add @tanstack/svelte-query-devtools
```

導入方式如下：

```ts
import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
```

## 浮動模式 (Floating Mode)

浮動模式會將開發者工具固定為應用程式中的浮動元素，並在畫面角落提供切換按鈕來顯示/隱藏工具。此切換狀態會儲存在 localStorage 中，重新載入後仍會保持記憶。

請將以下程式碼盡可能放在 Svelte 應用的最上層，越接近頁面根元素效果越好：

```ts
<script>
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
</script>

<QueryClientProvider client={queryClient}>
  {/* 應用程式的其餘部分 */}
  <SvelteQueryDevtools />
</QueryClientProvider>
```

### 選項設定

- `initialIsOpen: Boolean`
  - 設為 `true` 可讓開發工具預設為開啟狀態
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 預設值為 `bottom-right`
  - 控制 TanStack 商標按鈕的位置，用於開關開發工具面板
  - 若設為 `relative`，按鈕會出現在你渲染開發工具的位置
- `position?: "top" | "bottom" | "left" | "right"`
  - 預設值為 `bottom`
  - 控制 Svelte Query 開發工具面板的位置
- `client?: QueryClient`,
  - 可傳入自訂的 QueryClient，否則會使用最近上下文中的實例
- `errorTypes?: { name: string; initializer: (query: Query) => TError}`
  - 用於預定義可在查詢中觸發的錯誤類型。當從 UI 觸發該錯誤時，初始化函式會接收特定查詢並必須回傳一個 Error 物件
- `styleNonce?: string`
  - 用於傳遞 nonce 給新增到文件 head 的 style 標籤。適用於使用內容安全策略 (CSP) nonce 來允許內聯樣式的情況
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發工具的樣式應用到 DOM 中的 head 標籤
  - 可傳入 shadow DOM 目標，讓樣式改為在 shadow DOM 內應用，而非 light DOM 的 head 標籤內
