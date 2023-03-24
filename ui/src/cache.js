import { InMemoryCache, Reference, MakeVar } from "@apollo/client";

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        todos: {
          keyArgs: false,
          merge(existing, incoming) {
            let todos = [];
            if (existing && existing.todos) {
              todos = todos.concat(existing.todos);
            }
            if (incoming && incoming.todos) {
              todos = todos.concat(incoming.todos);
            }
            return {
              ...incoming,
              todos,
            };
          },
        },
      },
    },
  },
});
