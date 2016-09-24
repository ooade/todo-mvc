import React from 'react';
import Relay from 'react-relay';
import TodoItem from './TodoItem';
import TodoFooter from './TodoFooter';

import UpdateTodoMutation from './UpdateTodoMutation';
import DeleteTodoMutation from './DeleteTodoMutation';

const TODO_FILTERS = {
  ['SHOW_ALL']: () => true,
  ['SHOW_ACTIVE']: todo => !todo.node.completed,
  ['SHOW_COMPLETED']: todo => todo.node.completed
}

export default class TodoMainBody extends React.Component {
  static propTypes = {
    viewer: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = { filter: 'SHOW_ALL' }
  }

  handleClearCompleted(todos) {
    // TODO: Allow Delete Many for only users with authorized access
    // For now, we'll loop through the todos to delete each of them
    // Anyone up for this can make the PR

    todos.map(todo => {
      const deleteTodoMutation = new DeleteTodoMutation({ viewerId: this.props.viewerId, id: todo.node._id })
      Relay.Store.commitUpdate(deleteTodoMutation)
    })
  }

  handleShow(filter) {
    this.setState({ filter })
  }

  completeAll(todosAreCompleted, todos) {
    let updateTodoMutation;

    if (todosAreCompleted) {
      todos.map(todo => {
        updateTodoMutation = new UpdateTodoMutation({
          id: todo.node._id,
          text: todo.node.text,
          completed: false
        });
        Relay.Store.commitUpdate(updateTodoMutation);
      })
    }
    else {
      todos.map(todo => {
        updateTodoMutation = new UpdateTodoMutation({
          id: todo.node._id,
          text: todo.node.text,
          completed: true
        });
        Relay.Store.commitUpdate(updateTodoMutation);
      })
    }
  }

  renderToggleAll(completedCount) {
    const { edges: todos, actions } = this.props.viewer.todos;
    if (todos.length > 0) {
      return (
        <input
          className='toggle-all'
          type='checkbox'
          checked={completedCount === todos.length}
          onChange={() => this.completeAll(completedCount === todos.length, todos)}
        />
      )
    }
  }

  renderFooter(completedCount) {
    const { edges: todos } = this.props.viewer.todos
    const { filter } = this.state
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <TodoFooter
          completedCount={completedCount}
          activeCount={activeCount}
          filter={filter}
          onClearCompleted={
            this.handleClearCompleted.bind(this, todos.filter(todo => todo.node.completed))
          }
          onShow={this.handleShow.bind(this)}
        />
      )
    }
  }

  render() {
    const { edges: todos } = this.props.viewer.todos;
    const { filter } = this.state

    const filteredTodos = todos.filter(TODO_FILTERS[filter])
    const completedCount = todos.reduce((count, todo) =>
      todo.node.completed ? count + 1 : count,
      0
    )

    return (
      <section className='main'>
        {this.renderToggleAll(completedCount)}
        <ul className='todo-list'>
          {filteredTodos.map((todo, id) =>
            <TodoItem
              key={id}
              todo={todo.node}
              viewerId={this.props.id}
              >
              {todo.node.text}
            </TodoItem>
          )}
        </ul>
        {this.renderFooter(completedCount)}
      </section>
    )
  }
}
