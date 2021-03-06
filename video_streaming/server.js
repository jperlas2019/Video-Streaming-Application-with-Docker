'use strict';
const fileUpload = require('express-fileupload')
const mysql = require('mysql2');
const axios = require('axios')
const express = require('express');
const session = require('express-session')
const http = require('http')
const PORT = 8100;
const HOST = '192.168.100.50';
const app = express();
const PATH = "/usr/src/app/"

var con = mysql.createPool({
  host: "192.168.100.10",
  user: "jperlas",
  password: "1234"
});

app.use(session({resave: true, saveUninitialized: true, secret: '1234'}))

app.use(fileUpload()); // don't delete this, otherwise req.body becomes undefined

app.get('/', (req, res) => {
  let sessionData = req.session
  if (sessionData.authenticated != true) {
    res.redirect('/login')
  } else {
    let videos = []
    con.query("SELECT * FROM videos.files", function(err, result) {
      for(let i=0; i<result.length; i++) {
        videos.push(result[i])
      }
      let html = `<p>Videos available to watch:</p>
                  <table>`
      for(let i=0; i<videos.length; i++) {
        html += `<tr>
                <td><a href="http://localhost:8100/watch/${videos[i]['name']}"> ${videos[i]['name']} </a>
                </tr>`
      }
      html += `</table>`
  
      res.send(html)
    })
  }
});

app.get('/login', (req, res) => {
  res.sendFile(PATH + "login.html")
})

app.post('/authenticate', (req, res) => {
  let sessionData = req.session;
  let data = {'username': req.body['username'], 'password': req.body['password']}
  axios.post('http://192.168.100.40:8110', JSON.stringify(data), {headers: {'Content-Type': 'application/json'}})
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


app.get('/watch/:videoname', (req, res) => {
  con.query(`SELECT path FROM videos.files WHERE name='${req.params["videoname"]}' LIMIT 1`, function(err, result) {
    console.log(result[0]["path"])
    let path = (result[0]["path"]).replace(/\//g, "%2F") // "/\//g" means replace all forward slashes with %2F. %2F is URL encoding for "/"

    let html = `<video width="320" height="240" controls>
    <source src="http://localhost:8100/play/${req.params["videoname"]}/${path}" type="video/mp4">
    </video>`
    res.send(html)
  })
})

app.get('/play/:videoname/:path', (req, res) => {
  http.get(`http://192.168.100.30:8090/video?name=${req.params["videoname"]}&path=${req.params["path"]}`, (response) => {
    response.pipe(res)
  })
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
