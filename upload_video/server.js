'use strict';
const fileUpload = require("express-fileupload");
const mysql = require('mysql2');
const axios = require('axios')
const express = require('express');
const session = require('express-session')
const PORT = 8080;
const HOST = '192.168.100.20';
const app = express();
const PATH = "/usr/src/app/"

var con = mysql.createPool({
  host: "192.168.100.10",
  user: "jperlas",
  password: "1234"
});

app.use(session({resave: true, saveUninitialized: true, secret: '1234'}))

app.use(fileUpload());

app.get('/', (req, res) => {
  let sessionData = req.session
  if (sessionData.authenticated != true) {
    res.redirect('/login')
  } else {
    res.sendFile(PATH + "index.html")
  }

});

app.get('/login', (req, res) => {
  res.sendFile(PATH + "login.html")
})

app.post('/authenticate', (req, res) => {
  let sessionData = req.session;
  let data = {'username': req.body['username'], 'password': req.body['password']}
  axios.post('http://192.168.100.40:8110/', JSON.stringify(data), {headers: {'Content-Type': 'application/json'}})
    .then(function (response) {
      if (response.data['success'] == true) {
        sessionData.authenticated = true
        res.redirect('/')
      } else {
        sessionData.authenticated = false
        res.send('Incorrect username or password.')
      }
    })
})

app.post('/upload', (req, res) => {
  let file = req.files.file;

  con.query("CREATE DATABASE IF NOT EXISTS videos", function(err, result) {
    if (err) {
      console.log(err)
      return res.send(JSON.stringify(err))
    } else {
      console.log("Database 'videos' created")
      con.query("CREATE TABLE IF NOT EXISTS videos.files ( id INT(6) AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, path VARCHAR(255) NOT NULL)", function(err, result) {
        if (err) {
          console.log(err)
          return res.send(JSON.stringify(err))
        } else {
          console.log("Table 'files' created")
          con.query(`INSERT INTO videos.files (name, path) VALUES ("${file.name}", "${PATH}")`, function (err, result) {
            if (err) { 
              console.log(err)
              return res.send(JSON.stringify(err))
            } else {
              console.log(`Filename ${file.name} and path ${PATH} inserted into table "files"`);
            }
          });
        }
      });
    }
  });





  let data = {'name': file.name, 'data': file['data'], 'path': PATH}
  axios.post('http://192.168.100.30:8090/store', data, {headers: {'Content-Type': 'application/json'}})
    .then(function (response) {
      return res.send(`${JSON.stringify(response.data)} <br> <a href="http://localhost:8100">Click here to watch uploaded videos</a>`)
    })
  });


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
