import React from "react";

function TodoTile(props) {
  return (
    <div style={{ padding: "50px", background: "hotpink", margin: "15px" }}>
      todo id: {props.todo.id}, todo title: {props.todo.title}
    </div>
  );
}

export default TodoTile;
