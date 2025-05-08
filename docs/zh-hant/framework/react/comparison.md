---
source-updated-at: '2024-07-11T12:20:14.000Z'
translation-updated-at: '2025-05-08T20:18:52.803Z'
id: comparison
title: 比較
---

> 本比較表力求準確且不偏頗。若您使用過其中任何函式庫並認為資訊可改進，歡迎透過頁面底部的「在 Github 上編輯此頁」連結提出修改建議（需附上說明或佐證依據）。

功能/能力對照鍵：

- ✅ 一級支援、內建且無需額外配置或程式碼即可使用
- 🟡 支援，但屬於非官方的第三方或社群函式庫/貢獻
- 🔶 支援並有文件說明，但需使用者自行編寫額外程式碼來實現
- 🛑 無官方支援或文件記載

|                                   | React Query                              | SWR [_(官網)_][swr]              | Apollo Client [_(官網)_][apollo]   | RTK-Query [_(官網)_][rtk-query]      | React Router [_(官網)_][react-router]                                     |
| --------------------------------- | ---------------------------------------- | -------------------------------- | ---------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| Github 儲存庫 / 星數              | [![][stars-react-query]][gh-react-query] | [![][stars-swr]][gh-swr]         | [![][stars-apollo]][gh-apollo]     | [![][stars-rtk-query]][gh-rtk-query] | [![][stars-react-router]][gh-react-router]                                |
| 平台需求                          | React                                    | React                            | React, GraphQL                     | Redux                                | React                                                                     |
| 官方比較文件                      |                                          | (無)                             | (無)                               | [比較][rtk-query-comparison]         | (無)                                                                      |
| 支援的查詢語法                    | Promise, REST, GraphQL                   | Promise, REST, GraphQL           | GraphQL, 任意 (Reactive Variables) | Promise, REST, GraphQL               | Promise, REST, GraphQL                                                    |
| 支援的框架                        | React                                    | React                            | React + 其他                       | 任意                                 | React                                                                     |
| 快取策略                          | 階層式鍵值對 (Hierarchical Key -> Value) | 唯一鍵值對 (Unique Key -> Value) | 正規化結構 (Normalized Schema)     | 唯一鍵值對 (Unique Key -> Value)     | 巢狀路由對應值 (Nested Route -> value)                                    |
| 快取鍵生成策略                    | JSON                                     | JSON                             | GraphQL 查詢                       | JSON                                 | 路由路徑 (Route Path)                                                     |
| 快取變更偵測                      | 深度比對鍵值 (穩定序列化)                | 深度比對鍵值 (穩定序列化)        | 深度比對鍵值 (不穩定序列化)        | 鍵值參照相等性 (===)                 | 路由變更                                                                  |
| 資料變更偵測                      | 深度比對 + 結構共享                      | 深度比對 (透過 `stable-hash`)    | 深度比對 (不穩定序列化)            | 鍵值參照相等性 (===)                 | 載入器執行 (Loader Run)                                                   |
| 資料記憶化                        | 完整結構共享                             | 識別相等性 (===)                 | 正規化識別性                       | 識別相等性 (===)                     | 識別相等性 (===)                                                          |
| 套件體積                          | [![][bp-react-query]][bpl-react-query]   | [![][bp-swr]][bpl-swr]           | [![][bp-apollo]][bpl-apollo]       | [![][bp-rtk-query]][bpl-rtk-query]   | [![][bp-react-router]][bpl-react-router] + [![][bp-history]][bpl-history] |
| API 定義位置                      | 元件內、外部配置檔                       | 元件內                           | GraphQL Schema                     | 外部配置檔                           | 路由樹配置                                                                |
| 查詢功能                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 快取持久化                        | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑 僅當前路由有效 <sup>8</sup>                                            |
| 開發者工具                        | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 輪詢/間隔查詢                     | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 平行查詢                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 依賴查詢                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 分頁查詢                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 無限查詢                          | ✅                                       | ✅                               | ✅                                 | 🛑                                   | 🛑                                                                        |
| 雙向無限查詢                      | ✅                                       | 🔶                               | 🔶                                 | 🛑                                   | 🛑                                                                        |
| 無限查詢重新取得                  | ✅                                       | ✅                               | 🛑                                 | 🛑                                   | 🛑                                                                        |
| 滯後查詢資料<sup>1</sup>          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 選擇器                            | ✅                                       | 🛑                               | ✅                                 | ✅                                   | N/A                                                                       |
| 初始資料                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 滾動位置恢復                      | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 快取操作                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 過時查詢自動棄置                  | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 渲染批次處理與優化<sup>2</sup>    | ✅                                       | ✅                               | 🛑                                 | ✅                                   | ✅                                                                        |
| 自動垃圾回收                      | ✅                                       | 🛑                               | 🛑                                 | ✅                                   | N/A                                                                       |
| 變異鉤子                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 離線變異支援                      | ✅                                       | 🛑                               | 🟡                                 | 🛑                                   | 🛑                                                                        |
| 預取 API                          | ✅                                       | ✅                               | ✅                                 | ✅                                   | ✅                                                                        |
| 查詢取消                          | ✅                                       | 🛑                               | 🛑                                 | 🛑                                   | ✅                                                                        |
| 部分查詢匹配<sup>3</sup>          | ✅                                       | 🔶                               | ✅                                 | ✅                                   | N/A                                                                       |
| 重新驗證時保留過期資料            | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 過期時間配置                      | ✅                                       | 🛑<sup>7</sup>                   | 🛑                                 | ✅                                   | 🛑                                                                        |
| 預先配置查詢/變異行為<sup>4</sup> | ✅                                       | 🛑                               | ✅                                 | ✅                                   | ✅                                                                        |
| 視窗焦點時重新取得                | ✅                                       | ✅                               | 🛑                                 | ✅                                   | 🛑                                                                        |
| 網路狀態變更時重新取得            | ✅                                       | ✅                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 通用快取脫水/再水合               | ✅                                       | 🛑                               | ✅                                 | ✅                                   | ✅                                                                        |
| 離線快取                          | ✅                                       | 🛑                               | ✅                                 | 🔶                                   | 🛑                                                                        |
| React Suspense 支援               | ✅                                       | ✅                               | ✅                                 | 🛑                                   | ✅                                                                        |
| 抽象化/框架無關核心               | ✅                                       | 🛑                               | ✅                                 | ✅                                   | 🛑                                                                        |
| 變異後自動重新取得<sup>5</sup>    | 🔶                                       | 🔶                               | ✅                                 | ✅                                   | ✅                                                                        |
| 正規化快取<sup>6</sup>            | 🛑                                       | 🛑                               | ✅                                 | 🛑                                   | 🛑                                                                        |

### 備註

> **<sup>1</sup> 滯後查詢資料** - React Query 提供了一種方式，讓您能在新查詢載入時繼續顯示現有查詢的資料（類似於 Suspense 未來將原生提供的 UX）。這在實作分頁 UI 或無限載入 UI 時極為重要，因為您不會希望每次新查詢請求時都顯示生硬的載入狀態。其他函式庫不具備此能力，會在新查詢載入時（除非已預先取得）顯示生硬的載入狀態。

> **<sup>2</sup> 渲染優化** - React Query 具有出色的渲染效能。預設情況下，它會自動追蹤哪些欄位被存取，並僅在這些欄位變更時重新渲染。若想關閉此優化，將 `notifyOnChangeProps` 設為 `'all'` 會讓元件在查詢更新時（例如有新資料或正在載入狀態）重新渲染。若只關注 `data` 或 `error` 屬性，可將 `notifyOnChangeProps` 設為 `['data', 'error']` 進一步減少渲染次數。

> **<sup>3</sup> 部分查詢匹配** - 由於 React Query 使用確定性的查詢鍵序列化，這讓您能操作一組變數查詢，而無需知道每個要匹配的具體查詢鍵。例如，您可以重新取得所有鍵以 `todos` 開頭的查詢（無論變數為何），或是針對帶有（或不帶）變數或巢狀屬性的特定查詢，甚至使用過濾函式只匹配符合特定條件的查詢。

> **<sup>4</sup> 預先配置查詢行為** - 這其實就是能在查詢和變異被使用前，預先配置其行為的進階功能。例如，查詢可事先完整配置預設值，使用時只需呼叫 `useQuery({ queryKey })`，而無需每次使用時都傳遞獲取函式或選項。SWR 透過允許配置全域預設獲取函式，部分支援此功能，但無法針對單一查詢或變異進行配置。

> **<sup>5</sup> 變異後自動重新取得** - 要真正在變異後自動重新取得資料，需具備結構描述（如 GraphQL 提供的）以及協助函式庫識別該結構描述中個體與個體類型的啟發式方法。

> **<sup>6</sup> 正規化快取** - React Query、SWR 和 RTK-Query 目前不支援自動正規化快取，該技術透過將個體儲存為扁平結構來避免高階資料重複。

> **<sup>7</sup> SWR 的不可變模式** - SWR 提供「不可變」模式，允許查詢在快取生命週期內僅取得一次，但仍不具備過期時間概念或有條件的自動重新驗證功能。

> **<sup>8</sup> React Router 的快取持久性** - React Router 不會快取超出當前匹配路由的資料。離開路由後，其資料即遺失。

[bpl-react-query]: https://bundlephobia.com/result?p=react-query
[bp-react-query]: https://badgen.net/bundlephobia/minzip/react-query?label=💾
[gh-react-query]: https://github.com/tannerlinsley/react-query
[stars-react-query]: https://img.shields.io/github/stars/tannerlinsley/react-query?label=%F0%9F%8C%9F
[swr]: https://github.com/vercel/swr
[bp-swr]: https://badgen.net/bundlephobia/minzip/swr?label=💾
[gh-swr]: https://github.com/vercel/swr
[stars-swr]: https://img.shields.io/github/stars/vercel/swr?label=%F0%9F%8C%9F
[bpl-swr]: https://bundlephobia.com/result?p=swr
[apollo]: https://github.com/apollographql/apollo-client
[bp-apollo]: https://badgen.net/bundlephobia/minzip/@apollo/client?label=💾
[gh-apollo]: https://github.com/apollographql/apollo-client
[stars-apollo]: https://img.shields.io/github/stars/apollographql/apollo-client?label=%F0%9F%8C%9F
[bpl-apollo]: https://bundlephobia.com/result?p=@apollo/client
[rtk-query]: https://redux-toolkit.js.org/rtk-query/overview
[rtk-query-comparison]: https://redux-toolkit.js.org/rtk-query/comparison
[rtk-query-bundle-size]: https://redux-toolkit.js.org/rtk-query/comparison#bundle-size
[bp-rtk]: https://badgen.net/bundlephobia/minzip/@reduxjs/toolkit?label=💾
[bp-rtk-query]: https://badgen.net/bundlephobia/minzip/@reduxjs/toolkit?label=💾
[gh-rtk-query]: https://github.com/reduxjs/redux-toolkit
[stars-rtk-query]: https://img.shields.io/github/stars/reduxjs/redux-toolkit?label=🌟
[bpl-rtk]: https://bundlephobia.com/result?p=@reduxjs/toolkit
[bpl-rtk-query]: https://bundlephobia.com/package/@reduxjs/toolkit
[react-router]: https://github.com/remix-run/react-router
[bp-react-router]: https://badgen.net/bundlephobia/minzip/react-router-dom?label=💾
[gh-react-router]: https://github.com/remix-run/react-router
[stars-react-router]: https://img.shields.io/github/stars/remix-run/react-router?label=%F0%9F%8C%9F
[bpl-react-router]: https://bundlephobia.com/result?p=react-router-dom
[bp-history]: https://badgen.net/bundlephobia/minzip/history?label=💾
[bpl-history]: https://bundlephobia.com/result?p=history
