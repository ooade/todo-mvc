import Relay from 'react-relay';

class UpdateTodoMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`
      mutation { updateTodo }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      text: this.props.text,
      completed: this.props.completed
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on updateTodoPayload {
        changedTodo {
          text
          completed
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        changedTodo: this.props.id
      }
    }];
  }

  getOptimisticResponse() {
    return {
      todo: {
        id: this.props.id,
        text: this.props.text,
        completed: this.props.completed
      },
    };
  }
}

export default UpdateTodoMutation;
