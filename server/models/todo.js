import mongoose from 'mongoose';

// Make use of ES6 promise
mongoose.Promise = global.Promise;

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    description: 'A todo'
  },
  completed: {
    type: Boolean,
    default: false,
    description: 'Returns True for completed Todo'
  }
});

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
