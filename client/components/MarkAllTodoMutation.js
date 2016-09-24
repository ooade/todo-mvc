import Relay from 'react-relay';

class MarkAllTodoMutation extends Relay.Mutation {
  static fragments = {
   // TODO: To Make a normal markAll Query

  getMutation() {
    return Relay.QL`
      mutation { updateTodo }
    `;
  }

  getVariables() {
    return {
      completed: this.props.completed
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateTodoPayload {
        changedTodo {
          text
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewerId
      }
    }];
  }

  getOptimisticResponse() {
    const viewerPayload = { id: this.props.viewerId };
    if (this.props.todos) {
      viewerPayload.todos = {
        edges: this.props.todos.edges
          .filter(edge => edge.node.completed !== this.props.completed)
          .map(edge => ({
            node: {
              completed: this.props.completed,
              id: edge.node.id
            }
          }))
      }
    }
    return {
      viewer: viewerPayload
    };
  }
}

export default MarkAllTodoMutation;
