---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:45.874Z'
id: does-this-replace-client-state
title: '這會取代 [Vuex, Pinia] 嗎？'
---

好的，讓我們從幾個重點開始：

- TanStack Query 是一個 **伺服器狀態 (server-state)** 函式庫，負責管理伺服器與客戶端之間的異步操作
- Vuex、Pinia、Zustand 等則是 **客戶端狀態 (client-state)** 函式庫，雖然可用於儲存異步數據，但與 TanStack Query 這類工具相比效率較低

明白這些要點後，簡短的回答是：TanStack Query **取代了那些用來管理客戶端狀態中緩存數據的樣板程式碼和相關配置，並將其簡化為寥寥數行程式碼。**

對於大多數應用程式來說，當你把所有異步程式碼遷移到 TanStack Query 後，真正剩下的**全局可訪問客戶端狀態**通常非常少。

> 當然仍有某些情況，應用程式可能確實存在大量同步的純客戶端狀態（例如視覺設計工具或音樂製作應用程式），這時你可能還是需要客戶端狀態管理工具。需要注意的是，**TanStack Query 並非本地/客戶端狀態管理的替代品**。不過你可以毫無問題地將 TanStack Query 與大多數客戶端狀態管理工具搭配使用。

## 一個刻意的範例

這裡我們有一個由全局狀態函式庫管理的「全局」狀態：

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

目前全局狀態管理器緩存了 4 種伺服器狀態：`projects`、`teams`、`tasks` 和 `users`。如果我們將這些伺服器狀態資源移至 TanStack Query，剩下的全局狀態會變成這樣：

```tsx
const globalState = {
  themeMode,
  sidebarStatus,
}
```

這也意味著，只需調用幾次 `useQuery` 和 `useMutation` 鉤子，我們就能移除所有用於管理伺服器狀態的樣板程式碼，例如：

- 連接器 (Connectors)
- 動作創建器 (Action Creators)
- 中介軟體 (Middlewares)
- 歸約器 (Reducers)
- 載入/錯誤/結果狀態 (Loading/Error/Result states)
- 上下文 (Contexts)

移除這些東西後，你可能會問自己：**「為了這麼一點全局狀態，還值得繼續使用客戶端狀態管理工具嗎？」**

**這就由你決定了！**

但 TanStack Query 的角色很明確。它能從你的應用程式中移除異步配置和樣板程式碼，並用寥寥數行程式碼取而代之。

還在等什麼？趕快試試看吧！
