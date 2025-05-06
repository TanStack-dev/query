---
source-updated-at: '2024-11-19T18:32:49.000Z'
translation-updated-at: '2025-05-03T22:08:27.205Z'
id: quick-start
title: 快速开始
---

> 重要提示：当前该库处于实验阶段。这意味着次要版本和补丁版本都可能包含破坏性变更。升级时请谨慎操作。如果在生产环境中使用实验阶段的版本，请锁定到具体的补丁版本以避免意外的破坏性变更。

[//]: # '示例'

如需查看完整功能示例，请参考我们的 [基础 codesandbox 示例](../examples/basic)

### 为应用提供客户端

```ts
import { provideHttpClient } from '@angular/common/http'
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideTanStackQuery(new QueryClient())],
})
```

或在基于 NgModule 的应用中

```ts
import { provideHttpClient } from '@angular/common/http'
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [provideTanStackQuery(new QueryClient())],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 包含查询与变更的组件

```angular-ts
import { Component, Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { lastValueFrom } from 'rxjs'

import {
  injectMutation,
  injectQuery,
  QueryClient
} from '@tanstack/angular-query-experimental'

@Component({
  standalone: true,
  template: `
    <div>
      <button (click)="onAddTodo()">添加待办</button>

      <ul>
        @for (todo of query.data(); track todo.title) {
          <li>{{ todo.title }}</li>
        }
      </ul>
    </div>
  `,
})
export class TodosComponent {
  todoService = inject(TodoService)
  queryClient = inject(QueryClient)

  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => this.todoService.getTodos(),
  }))

  mutation = injectMutation(() => ({
    mutationFn: (todo: Todo) => this.todoService.addTodo(todo),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  }))

  onAddTodo() {
    this.mutation.mutate({
      id: Date.now().toString(),
      title: '洗衣服',
    })
  }
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient)

  getTodos(): Promise<Todo[]> {
    return lastValueFrom(
      this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos'),
    )
  }

  addTodo(todo: Todo): Promise<Todo> {
    return lastValueFrom(
      this.http.post<Todo>('https://jsonplaceholder.typicode.com/todos', todo),
    )
  }
}

interface Todo {
  id: string
  title: string
}
```

[//]: # '示例'
