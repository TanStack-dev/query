---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-06T04:24:54.134Z'
id: graphql
title: GraphQL
---

由于 React Query 的获取机制是基于 Promise 无感知构建的，你可以将 React Query 与任何异步数据获取客户端一起使用，包括 GraphQL！

> 请注意，React Query 不支持规范化缓存。虽然绝大多数用户实际上并不需要规范化缓存，甚至从中获得的收益比他们想象的要少得多，但在极少数情况下可能需要它。因此，请务必先与我们确认，以确保这确实是您所需要的功能！

[//]: # 'Codegen'

## 类型安全与代码生成

React Query 结合 `graphql-request^5` 和 [GraphQL Code Generator](https://graphql-code-generator.com/) 使用，可以提供完全类型化的 GraphQL 操作：

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
  // `data` 是完全类型化的！
  const { data } = useQuery({
    queryKey: ['films'],
    queryFn: async () =>
      request(
        'https://swapi-graphql.netlify.app/.netlify/functions/index',
        allFilmsWithVariablesQueryDocument,
        // 变量也会进行类型检查！
        { first: 10 },
      ),
  })
  // ...
}
```

_你可以在 [代码仓库中找到完整示例](https://github.com/dotansimha/graphql-code-generator/tree/7c25c4eeb77f88677fd79da557b7b5326e3f3950/examples/front-end/react/tanstack-react-query)_

请参考 [GraphQL Code Generator 文档中的专用指南](https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue) 开始使用。

[//]: # 'Codegen'
