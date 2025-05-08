---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:23:51.769Z'
id: does-this-replace-client-state
title: '這會取代 [Redux, MobX 等] 嗎？'
---

好的，讓我們從幾個重點開始：

- TanStack Query 是一個 **伺服器狀態 (server-state)** 函式庫，負責管理伺服器與客戶端之間的異步操作
- Redux、MobX、Zustand 等則是 **客戶端狀態 (client-state)** 函式庫，雖然可用於儲存異步資料，但與 TanStack Query 這類工具相比效率較低

理解這些要點後，簡短的回答是：TanStack Query **能取代那些用來管理客戶端狀態快取資料的樣板程式碼與相關配置，並僅需幾行程式碼即可實現相同功能**。

對於大多數應用程式而言，當你將所有異步程式碼遷移到 TanStack Query 後，真正剩下的**全域可存取客戶端狀態**通常非常少。

> 當然仍有某些情況，例如應用程式確實擁有大量同步的純客戶端狀態（如視覺設計工具或音樂製作軟體），這時你可能還是需要客戶端狀態管理工具。值得注意的是，**TanStack Query 並非用於取代本地/客戶端狀態管理**。不過，你可以毫無問題地將 TanStack Query 與大多數客戶端狀態管理工具一起使用。

## 一個刻意設計的範例

這裡我們有一個由全域狀態函式庫管理的「全域」狀態：

```tsx
const globalState = {
  projects,
  teams,
  tasks,
  users,
  themeMode,
  sidebarStatus,
}
```

目前，全域狀態管理工具快取了 4 種伺服器狀態：`projects`、`teams`、`tasks` 和 `users`。如果我們將這些伺服器狀態資產移至 TanStack Query，剩下的全域狀態會變成這樣：

```tsx
const globalState = {
  themeMode,
  sidebarStatus,
}
```

這也意味著，只需使用 `useQuery` 和 `useMutation` 幾個鉤子呼叫，我們就能移除所有用於管理伺服器狀態的樣板程式碼，例如：

- 連接器 (Connectors)
- 動作創建器 (Action Creators)
- 中介軟體 (Middlewares)
- 歸約器 (Reducers)
- 載入/錯誤/結果狀態 (Loading/Error/Result states)
- 上下文 (Contexts)

移除這些東西後，你可能會問自己：**「為了這麼少量的全域狀態，是否還值得繼續使用客戶端狀態管理工具？」**

**這就由你決定了！**

但 TanStack Query 的角色很明確。它能從你的應用程式中移除異步邏輯與樣板程式碼，並僅用幾行程式碼取代。

還在等什麼？現在就試試看吧！
