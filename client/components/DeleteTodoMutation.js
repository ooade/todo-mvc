import Relay from 'react-relay';

class DeleteTodoMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`
      mutation { deleteTodo }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      text: this.props.text
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on deleteTodoPayload {
        id
        viewer {
          id
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'viewer',
      parentID: this.props.viewerId,
      connectionName: 'TodoConnection',
      deletedIDFieldName: 'id'
    }];
  }
}

export default DeleteTodoMutation;
