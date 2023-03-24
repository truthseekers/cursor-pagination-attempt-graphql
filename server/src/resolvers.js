const todoData = require("../data/todos.json");
const { paginateResults, paginateResultsOld } = require("./utils");

const Query = {
  hello: (parent, args, context, info) => {
    return "duuuude";
  },
  todos: async (_, { first, after, last, before }, { dataSources }) => {
    // pass in all the todos to the paginateResults.

    // possible Mongod situations:
    // Million users, and a paginated list to look through all of them. Would you query all million, pass into paginated results? and store all that in the cache and make sure the cache stays up to date?

    // we can

    const todoConnections = paginateResults({
      first,
      after,
      results: todoData,
      before,
      last,
    });

    return todoConnections;
  },
  // todosOld not important
  todosOld: async (_, { pageSize = 3, after }, { dataSources }) => {
    const allTodos = todoData.map((todo) => {
      todo.cursor = todo.id + "pie";
      return todo;
    });
    // we want these in reverse chronological order
    allTodos.reverse();
    // console.log("allTodos after reversal: ", allTodos);
    console.log("going into paginateResults...");
    const todos = paginateResultsOld({
      after,
      pageSize,
      results: allTodos,
    });

    // console.log("todos: ", todos);
    let currentSetEndCursor = todos[todos.length - 1].cursor; // errors when todos returns empty array.
    let entireSetEndCursor = allTodos[allTodos.length - 1].cursor;
    console.log("currentSetEndCursor: ", currentSetEndCursor);
    console.log("entireSetEndCursor: ", entireSetEndCursor);

    return {
      todos,
      // cursor: if todos length is above 0, the cursor is the last todos cursor. if todos.length is false, return null.
      cursor: todos.length ? todos[todos.length - 1].cursor : null,
      // hasMore: if the last elements cursor in the current set is NOT equal to the last elements cursor in the entire set (return true)
      // otherwise return false.  So.. if the current cursor is equal to the last cursor then hasMore = false?
      hasMore: todos.length
        ? todos[todos.length - 1].cursor !==
          allTodos[allTodos.length - 1].cursor
        : false,
    };
  },
};

const resolvers = {
  Query,
};

module.exports = {
  resolvers,
};
