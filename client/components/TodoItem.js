import React from 'react';
import Relay from 'react-relay';
import classnames from 'classnames';

import TodoTextInput from './TodoTextInput';
import UpdateTodoMutation from './UpdateTodoMutation';
import DeleteTodoMutation from './DeleteTodoMutation';

export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    }
  }

  handleDoubleClick() {
    this.setState({ editing: true })
  }

  handleSave(id, text, completed) {
    if (text.length === 0) {
      const deleteTodoMutation = new DeleteTodoMutation({ viewerId: this.props.viewerId, id });
      Relay.Store.commitUpdate(deleteTodoMutation);
    } else {
      const updateTodoMutation = new UpdateTodoMutation({ id, text, completed });
      Relay.Store.commitUpdate(updateTodoMutation);
    }
    this.setState({ editing: false })
  }

  render() {
    const { todo, completeTodo } = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput
          text={todo.text}
          editing={this.state.editing}
          onSave={(text) => this.handleSave(todo._id, text, todo.completed)}
        />
      )
    } else {
      element = (
        <div className='view'>
          <input
            className='toggle'
            type='checkbox'
            checked={todo.completed}
            onChange={() => this.handleSave(todo._id, todo.text, !todo.completed)}
          />
          <label
            style={{fontSize: 'medium'}}
            onDoubleClick={this.handleDoubleClick.bind(this)}
            >
            {todo.text}
          </label>
          <button
            className='destroy'
            onClick={() => this.handleSave(todo._id, "")} />
        </div>
      )
    }

    return (
      <li className={classnames({
        completed: todo.completed,
        editing: this.state.editing
      })}>
        {element}
      </li>
    )
  }
}
