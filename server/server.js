
var bodyParser= require('body-parser');
var express = require('express');
var _ = require('lodash');

var app = express();

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {ObjectID}=require('mongodb');
const { User } = require('./models/user');
const {authenticate}= require('./middleware/authenticate');

app.use(bodyParser.json());
app.post('/todo',(req,res)=>{
    var todo = new Todo({
        text:req.body.text
    });
    todo.save().then((doc)=>{
        res.send(doc);
    },(e)=>{
        res.status(400).send(e);
    })
})

app.get('/todos',(req,res)=>{
    Todo.find().then((todos)=>{
        res.send({todos});
    },(e)=>{
        res.status(400).send(e);
    })
})

app.get('/todo/:id',(req,res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id))
     res.status(404).send();

    Todo.findById(id).then((todo)=>{
        if(!todo) res.status(404).send();
        res.send({todo});
    },(e)=>{
        res.status(400).send(e);
    })
})

app.delete('/todo/:id',(req,res)=>{
    var id = req.params.id;
    if(!ObjectID.isValid(id))
     res.status(404).send();

    Todo.findByIdAndDelete({_id:new ObjectID(id)}).then((todo)=>{
        if(!todo) res.status(404).send();
        res.send({todo});
    }).catch((e)=>{
        res.status(400).send(e);
    })
})

app.patch('/todo/:id',(req,res)=>{
    var id = req.params.id;  
    var body = _.pick(req.body, ['text','completed']);

    if(!ObjectID.isValid(id))
     res.status(404).send();

     if(_.isBoolean(body.completed) && body.completed){
         body.completed =true;
         body.completedAt = new Date().getTime();
     }else{
        body.completed =false;
        body.completedAt = null;
     }

    Todo.findOneAndUpdate({_id:new ObjectID(id)},{$set:body},{new:true}).then((todo)=>{
    if(!todo){
        res.status(404).send();
    }
    res.send(todo);
   }).catch((err)=>{
    res.status(404).send(err)});
})

app.post('/users',(req,res)=>{
 var body =_.pick(req.body,['email','password']);
 var user = new User(body);
    user.save().then(()=>{
        return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user)
    }).catch((e)=>{
        res.status(400).send(e);
    })
})
 
app.listen(3000,()=>{
    console.log('started on port 3000');
})

app.get('/user/me',authenticate,(req,res)=>{
     res.send(req.user);
})

// app.get('/user/me',(req,res)=>{
//     var token= req.header('x-auth');
//     User.findByToken(token).then((user)=>{
//     if(!user){
//         Promise.reject();
//     }
//      res.send(user);
//     }).catch((e)=>{
//      res.status(401).send();
//     });
// })

module.exports ={app};

// var newTodo =new Todo({
//     text:'eat dinner',
//     completed:true,
//     completedAt:13991114
// })

// newTodo.save().then((doc)=>{
//     console.log(JSON.stringify(doc, undefined,2));
// },(err)=>{
//     console.log('unable to save todo',err);
// })