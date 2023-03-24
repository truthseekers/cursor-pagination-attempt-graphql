const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String
  }
  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type Query {
    todos(first: Int, after: String, last: Int, before: String): TodoConnection!
    hello: String!
    todo(id: ID!): Todo
    todosOld(pageSize: Int, after: String): TodoConnectionOld!
  }
  type TodoConnectionOld {
    cursor: String!
    hasMore: Boolean!
    todos: [Todo]!
    pageInfo: String
  }
  type TodoConnection {
    pageInfo: PageInfo!
    edges: [TodoEdge]
  }
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  type TodoEdge {
    node: Todo
    cursor: String!
  }
  type Example {
    id: ID!
    something: String!
  }
`;

module.exports = {
  typeDefs,
};
