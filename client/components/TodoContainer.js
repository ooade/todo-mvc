import Relay from 'react-relay';
import Todo from './TodoComponent';

export default Relay.createContainer(Todo, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        todos(first: 20, orderBy: _ID_DESC) {
          edges {
            node {
              _id
              text
              completed
            }
          }
        }
    }`
  }
});
