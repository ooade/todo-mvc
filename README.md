#Overview

This example project shows the basic usage of RelayJS in a react app. We were able to pull this off easily, thanks to [Graffiti Mongoose](https://github.com/RisingStack/graffiti-mongoose), whose schema we used in achieving this.

###### Drawbacks
Data mutations seem a bit slow because they are sent to the server immediately the action get triggered, we don't have redux / flux to help handle our state. Asides that, i think everything works just as fine.

###### Features
+ Mongoose
  - [x] Basic Mongoose Schema setup
+ GraphQL
  - [x] query
  - [x] mutation
  - [ ] subscription (In View)

### Contributing
If you can make this better, Make a PR. The only thing you should know is, we prefer the use of single quotes in jsx element and the use of [this](http://forum.freecodecamp.com/t/free-code-camp-javascript-style-guide/19121) style guide. Let's see what we could achieve together. Thanks!

### Testing
We don't have test specs for now on our react components, we'll fix that up soon.
  
### License
[MIT](https://github.com/marhyorh/todo-mvc/blob/master/LICENSE)
