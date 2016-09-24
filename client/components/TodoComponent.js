import React from 'react';
import Relay from 'react-relay';
import TodoTextInput from './TodoTextInput';
import TodoMainBody from './TodoMainBody';
import AddTodoMutation from './AddTodoMutation';

export default class Todo extends React.Component {
  static propTypes = {
    viewer: React.PropTypes.object.isRequired
  };

  handleSave(text) {
    text = text.trim();

    if (text.length > 0) {
      const addTodoMutation = new AddTodoMutation({
        viewerId: this.props.viewer.id,
        text
      });
      Relay.Store.commitUpdate(addTodoMutation);
    }
  }

  render() {
    return (
      <div className='todo'>
        <div className='todoapp'>
          <header className='header'>
            <h1> todos </h1>
            <TodoTextInput
              newTodo
              onSave={this.handleSave.bind(this)}
              placeholder='What needs to be done?'
            />
            <TodoMainBody viewer={this.props.viewer}/>
          </header>
        </div>
        <div style={{textAlign: 'center', marginTop: '100px', fontSize: '12px'}}>
          <p style={{color: '#bababa'}}> Double-click to edit a todo </p>
          <p style={{color: '#bababa'}}>
            Written by {' '}
            <a href='https://github.com/marhyorh' style={{textDecoration: 'None', color: '#111'}}>
              Ademola Adegbuyi
            </a>
          </p>
        </div>
      </div>
    );
  }
}
