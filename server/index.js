const express = require('express');
const app = express();
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.get('/',(req,res) => {
    res.send('Welcome');
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }));

app.use(cookieParser());

  
app.get('/hello',(req,res) => {
    res.send("welcomasdad");
});



//MiddleWare

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


 const url = 'mongodb+srv://ijaas:ijaas@cluster0.httu3xq.mongodb.net/test';
 const PORT = 5000;
//mongodb connection
 app.use(cors());
 app.use(express.json());
 dotenv.config({ path:'./auth/config.env' });
 console.log(process.env.PORT);



mongoose.connect(url).then(res => {
    console.log("connected");
});


require('./db/db');
app.use(require('./auth/auth'));






http.createServer(app).listen(PORT,(req,res) => {
    console.log(`server running on ${PORT}`);
});

require('./data/cookies')

