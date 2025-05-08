---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-08T20:17:59.962Z'
id: devtools
title: 開發工具
---

## 啟用開發者工具 (Devtools)

開發者工具能協助你除錯及檢查查詢 (queries) 與變異 (mutations)。你可以透過在 `provideTanStackQuery` 中加入 `withDevtools` 來啟用開發者工具。

預設情況下，當 Angular 的 [`isDevMode`](https://angular.dev/api/core/isDevMode) 回傳 true 時，開發者工具會自動啟用。因此你無需擔心在正式環境建置時會包含這些工具。核心工具會延遲載入 (lazily loaded) 並從打包程式碼中排除。在多數情況下，你只需在 `provideTanStackQuery` 中加入 `withDevtools()` 而無需額外設定。

```ts
import {
  QueryClient,
  provideTanStackQuery,
  withDevtools,
} from '@tanstack/angular-query-experimental'

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(new QueryClient(), withDevtools())],
}
```

## 設定開發者工具的載入時機

若你需要更精確控制開發者工具的載入時機，可以使用 `loadDevtools` 選項。這在需要根據環境設定載入工具時特別有用，例如測試環境可能運行在正式模式但仍需使用開發者工具。

當未設定此選項或設為 'auto' 時，開發者工具會在 Angular 處於開發模式時載入。

```ts
provideTanStackQuery(new QueryClient(), withDevtools())

// 等同於
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: 'auto' })),
)
```

當設為 true 時，開發者工具會在開發與正式模式中都載入。

```ts
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: true })),
)
```

當設為 false 時，開發者工具將不會載入。

```ts
provideTanStackQuery(
  new QueryClient(),
  withDevtools(() => ({ loadDevtools: false })),
)
```

`withDevtools` 的選項透過回呼函式 (callback function) 回傳以支援透過訊號 (signals) 實現的反應式 (reactivity) 功能。以下範例中，我們從監聽鍵盤快捷鍵的 RxJS 可觀察物件 (observable) 建立訊號。當事件觸發時，開發者工具會延遲載入。此技術讓你能支援在正式模式中按需載入開發者工具，而無需將完整工具包含在打包程式碼中。

```ts
@Injectable({ providedIn: 'root' })
class DevtoolsOptionsManager {
  loadDevtools = toSignal(
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      map(
        (event): boolean =>
          event.metaKey && event.ctrlKey && event.shiftKey && event.key === 'D',
      ),
      scan((acc, curr) => acc || curr, false),
    ),
    {
      initialValue: false,
    },
  )
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTanStackQuery(
      new QueryClient(),
      withDevtools(() => ({
        initialIsOpen: true,
        loadDevtools: inject(DevtoolsOptionsManager).loadDevtools(),
      })),
    ),
  ],
}
```

### 選項

以下選項 `client`、`position`、`errorTypes`、`buttonPosition` 和 `initialIsOpen` 支援透過訊號實現的反應式功能。

- `loadDevtools?: 'auto' | boolean`
  - 預設為 `auto`: 在開發模式時延遲載入開發者工具，正式模式則跳過載入。
  - 用於控制是否載入開發者工具。
- `initialIsOpen?: Boolean`
  - 設為 `true` 可讓工具面板預設為開啟狀態
- `buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative"`
  - 預設為 `bottom-right`
  - TanStack 商標按鈕的位置，用於開啟/關閉開發者工具面板
  - 設為 `relative` 時，按鈕會置於你渲染開發者工具的位置。
- `position?: "top" | "bottom" | "left" | "right"`
  - 預設為 `bottom`
  - Angular Query 開發者工具面板的位置
- `client?: QueryClient`,
  - 用於指定自訂的 QueryClient。若未提供，則會注入透過 `provideTanStackQuery` 提供的 QueryClient。
- `errorTypes?: { name: string; initializer: (query: Query) => TError}[]`
  - 用於預先定義可在查詢中觸發的錯誤類型。當從 UI 觸發該錯誤時，初始化器 (initializer) 會以特定查詢為參數被呼叫，並必須回傳一個錯誤物件。
- `styleNonce?: string`
  - 用於傳遞 nonce 給加入文件 head 的 style 標籤。這在使用內容安全政策 (CSP) nonce 允許內嵌樣式時特別有用。
- `shadowDOMTarget?: ShadowRoot`
  - 預設行為會將開發者工具的樣式套用到 DOM 中的 head 標籤。
  - 用於指定 shadow DOM 目標，讓樣式套用在 shadow DOM 內而非 light DOM 的 head 標籤中。
