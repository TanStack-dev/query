---
source-updated-at: '2024-12-16T15:14:41.000Z'
translation-updated-at: '2025-05-08T20:20:13.613Z'
id: broadcastQueryClient
title: broadcastQueryClient (實驗性)
---

> 非常重要：此工具目前處於實驗階段。這意味著在次要版本和修補版本中可能會出現破壞性變更。使用時請自行承擔風險。如果您選擇在生產環境中依賴此實驗階段的功能，請將版本鎖定在修補版本級別，以避免意外中斷。

`broadcastQueryClient` 是一個用於在同源瀏覽器分頁/視窗之間廣播和同步 `queryClient` 狀態的工具。

## 安裝

此工具以獨立套件形式提供，可透過 `'@tanstack/query-broadcast-client-experimental'` 導入使用。

## 使用方式

導入 `broadcastQueryClient` 函數，並傳入您的 `QueryClient` 實例，可選擇性地設定 `broadcastChannel`。

```tsx
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

const queryClient = new QueryClient()

broadcastQueryClient({
  queryClient,
  broadcastChannel: 'my-app',
})
```

## API

### `broadcastQueryClient`

傳入一個 `QueryClient` 實例，可選擇性地設定 `broadcastChannel`。

```tsx
broadcastQueryClient({ queryClient, broadcastChannel })
```

### `Options`

選項物件：

```tsx
interface BroadcastQueryClientOptions {
  /** 要同步的 QueryClient */
  queryClient: QueryClient
  /** 此為用於分頁與視窗間通訊的
   * 唯一頻道名稱 */
  broadcastChannel?: string
  /** BroadcastChannel API 的選項 */
  options?: BroadcastChannelOptions
}
```

預設選項為：

```tsx
{
  broadcastChannel = 'tanstack-query',
}
```
