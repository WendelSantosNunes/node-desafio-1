const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(item => item.username === username)

  if(!user){
    return response.status(400).json({error: 'Mensagem do erro'})
  }

  request.username = username;

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userExist = users.some(user => user.username === username)

  if(userExist){
    return response.status(400).json({error: 'Mensagem do erro'})
  }

  const userTodo = {"id": uuidv4(), name, username, "todos": []}

  users.push(userTodo)

  return response.status(201).json({"id": uuidv4(), name, username, "todos": []})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  
  const {todos} = users.find(item => item.username === username);

  return response.status(201).json(todos);  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request;

  const userTodo = {
    id: uuidv4(), // precisa ser um uuid
	  title,
	  done: false, 
	  deadline: new Date(deadline), 
	  created_at: new Date()
  }

  users.forEach((user) => {
    if(user.username === username){
      user.todos.push(userTodo)
    }
  })

  return response.status(201).json(userTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;
  const {username} = request;
  let message

  users.forEach((user) => {
    if(user.username === username){
       user.todos.forEach((item) => {
        if(item.id === id){
          item.deadline = new Date(deadline);
          item.title = title;
          message = response.status(201).json(item)
        }
       })
    }
  })

  return message || response.status(404).json({error: 'Mensagem do erro'})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {username} = request;
  let message

  users.forEach((user) => {
    if(user.username === username){
       user.todos.forEach((item) => {
        if(item.id === id){
          item.done = true
          message = response.status(201).json(item)
        }
       })
    }
  })

  return message || response.status(404).json({error: 'Mensagem do erro'})
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  let message

  console.log(username,id)
  users.forEach((user) => {
    if(user.username === username){
      let result = user.todos.some(obj => obj.id === id)
      
      if(result){
        user.todo = user.todos.splice(id,1)
        message = response.status(204).send()
      }
    }
  })

  return message || response.status(404).json({error: 'Mensagem do erro'})
});

module.exports = app;