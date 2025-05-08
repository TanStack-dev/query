---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:23:42.354Z'
id: important-defaults
title: 重要預設值
---

TanStack Query 預設採用了**積極但合理**的配置。**這些預設值有時會讓新用戶措手不及，或在使用者不知情的情況下使學習/除錯變得困難。** 在繼續學習和使用 TanStack Query 時，請記住以下幾點：

- 透過 `useQuery` 或 `useInfiniteQuery` 建立的查詢實例，預設會**將快取的資料視為過時的 (stale)**。

> 若要變更此行為，您可以在全域或單一查詢中透過 `staleTime` 選項進行配置。設定較長的 `staleTime` 意味著查詢不會頻繁重新取得資料。

- 在以下情況下，過時的查詢會在背景自動重新取得資料：
  - 新的查詢實例掛載時
  - 視窗重新獲得焦點時
  - 網路重新連線時
  - 查詢可選配置了重新取得間隔 (refetch interval) 時

> 若要變更此功能，可以使用 `refetchOnMount`、`refetchOnWindowFocus`、`refetchOnReconnect` 和 `refetchInterval` 等選項。

- 當 `useQuery`、`useInfiniteQuery` 或查詢觀察者 (query observers) 沒有活躍的實例時，查詢結果會被標記為「非活躍 (inactive)」，並保留在快取中以便後續再次使用。
- 預設情況下，「非活躍」的查詢會在 **5 分鐘** 後被垃圾回收。

  > 若要變更此設定，可以調整查詢的預設 `gcTime`，將其設為 `1000 * 60 * 5` 毫秒以外的值。

- 失敗的查詢會**靜默重試 3 次，並採用指數退避延遲 (exponential backoff delay)**，之後才會捕獲錯誤並顯示在 UI 上。

  > 若要變更此行為，可以調整查詢的預設 `retry` 和 `retryDelay` 選項，將其設為 `3` 和預設的指數退避函式以外的值。

- 預設情況下，查詢結果會**進行結構化共享 (structurally shared) 以檢測資料是否實際發生變更**，如果沒有變更，**資料的參考將保持不變**，這有助於提升 `useMemo` 和 `useCallback` 的值穩定性。如果這個概念聽起來陌生，請不必擔心！99.9% 的情況下您不需要停用此功能，它能在零成本的情況下提升應用程式的效能。

  > 結構化共享僅適用於 JSON 相容的值，其他任何值類型都會被視為已變更。例如，如果您因大型回應而遇到效能問題，可以透過 `config.structuralSharing` 標誌停用此功能。如果您在查詢回應中處理非 JSON 相容的值，但仍想檢測資料是否變更，可以自訂 `config.structuralSharing` 函式，根據舊回應和新回應計算值，並按需保留參考。

[//]: # 'Materials'

## 延伸閱讀

請參考以下社群資源文章，進一步了解預設行為的說明：

- [Practical React Query](../community/tkdodos-blog.md#1-practical-react-query)
- [React Query as a State Manager](../community/tkdodos-blog.md#10-react-query-as-a-state-manager)

[//]: # 'Materials'
