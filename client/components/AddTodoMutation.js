import Relay from 'react-relay';

class AddTodoMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`
      mutation { addTodo }
    `;
  }

  getVariables() {
    return {
      text: this.props.text
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on addTodoPayload @relay(pattern: true) {
        changedTodoEdge,
        viewer { todos }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewerId,
      connectionName: 'todos',
      edgeName: 'changedTodoEdge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }
  
}

export default AddTodoMutation;
