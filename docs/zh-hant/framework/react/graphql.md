---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:16:56.964Z'
id: graphql
title: GraphQL
---

由於 React Query 的資料獲取機制是基於 Promise 無關性 (agnostically) 建構的，你可以將 React Query 與任何非同步資料獲取客戶端搭配使用，包括 GraphQL！

> 請注意，React Query 不支援正規化快取 (normalized caching)。雖然絕大多數使用者實際上並不需要正規化快取，甚至從中獲得的效益不如他們想像的那麼多，但在極少數情況下可能需要此功能，因此請務必先與我們確認這是否確實是您需要的功能！

[//]: # 'Codegen'

## 型別安全與程式碼生成 (Type-Safety and Code Generation)

React Query 與 `graphql-request^5` 和 [GraphQL Code Generator](https://graphql-code-generator.com/) 結合使用時，可提供完整型別的 GraphQL 操作：

```tsx
import request from 'graphql-request'
import { useQuery } from '@tanstack/react-query'

import { graphql } from './gql/gql'

const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query allFilmsWithVariablesQuery($first: Int!) {
    allFilms(first: $first) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`)

function App() {
  // `data` 是完全型別化的！
  const { data } = useQuery({
    queryKey: ['films'],
    queryFn: async () =>
      request(
        'https://swapi-graphql.netlify.app/.netlify/functions/index',
        allFilmsWithVariablesQueryDocument,
        // 變數也會進行型別檢查！
        { first: 10 },
      ),
  })
  // ...
}
```

_你可以在 [專案儲存庫中找到完整範例](https://github.com/dotansimha/graphql-code-generator/tree/7c25c4eeb77f88677fd79da557b7b5326e3f3950/examples/front-end/react/tanstack-react-query)_

請參考 [GraphQL Code Generator 文件中的專用指南](https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue) 開始使用。

[//]: # 'Codegen'
