import React, { Fragment, useState, useEffect, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import TodoTile from "../components/TodoTile";

export const GET_TODOS = gql`
  query GetTodoList($after: String, $pageSize: Int) {
    todos(after: $after, pageSize: $pageSize) {
      cursor
      hasMore
      todos {
        id
        title
      }
    }
  }
`;

function ScrollWrapper({ children, fetchMore, pageSize, cursor, hasMore }) {
  const [prevY, setPrevY] = useState(0);
  let loadingRef = useRef(null);
  let hasMoreRef = useRef({});
  let prevYRef = useRef({});
  let cursorRef = useRef({});
  console.log("cursor up top? ", cursor);
  prevYRef.current = prevY;
  cursorRef.current = cursor;
  hasMoreRef.current = hasMore;

  useEffect(() => {
    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    observer.observe(loadingRef.current);
  }, []);

  const handleObserver = async (entities, observer) => {
    const y = entities[0].boundingClientRect.y;
    if (prevYRef.current > y && hasMoreRef.current) {
      await fetchMore({
        variables: {
          after: cursorRef.current,
          pageSize: pageSize,
        },
      });
    }
    setPrevY(y);
  };

  return (
    <div style={{ background: "lightgreen" }}>
      <h3>Before child?.</h3>
      {children}

      {hasMoreRef.current && (
        <div
          className="yoHello"
          ref={loadingRef}
          style={{ height: "100px", margin: "25px", background: "violet" }}
        >
          <span
            style={
              {
                /* display: loading ? "block" : "none" */
              }
            }
          >
            Loading...
          </span>
        </div>
      )}
    </div>
  );
}

function Frozen() {
  const { data, loading, error, fetchMore } = useQuery(GET_TODOS, {
    variables: { pageSize: 6 },
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (loading) return <div>loading...</div>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>NOT FOUND</p>;

  const handleScroll = (e) => {
    console.log("handling scroll...");
  };

  return (
    <Fragment>
      <ScrollWrapper
        onScroll={handleScroll}
        fetchMore={fetchMore}
        cursor={data.todos.cursor}
        hasMore={data.todos.hasMore}
        pageSize={6}
      >
        {data.todos &&
          data.todos.todos &&
          data.todos.todos.map((todo) => (
            <TodoTile key={todo.id} todo={todo} />
          ))}
        {data.todos &&
          data.todos.hasMore &&
          (isLoadingMore ? (
            <div>Loading...</div>
          ) : (
            <button
              onClick={async () => {
                setIsLoadingMore(true);
                await fetchMore({
                  variables: {
                    after: data.todos.cursor,
                    pageSize: 6,
                  },
                });
                setIsLoadingMore(false);
              }}
            >
              Load More
            </button>
          ))}
      </ScrollWrapper>
    </Fragment>
    // <div>Hey fuckin damn you cursor piece of shit</div>
  );
}

export default Frozen;
