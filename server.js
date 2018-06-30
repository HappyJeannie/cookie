var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.env.PORT || 8888;
var md5 = require('md5-node');
console.log(md5('hello'));
let sessions = {};
var server = http.createServer((req,res)=>{
  let temp = url.parse(req.url,true);
  let path = temp.pathname;
  let query = temp.query;
  let method = req.method.toLowerCase();
  if(path === '/'  && method === 'get'){
    res.statusCode = 200;
    let str = fs.readFileSync('./index.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    let cookies = req.headers.cookie === undefined ? [] : req.headers.cookie.split('; ');
    let hash = {};
    cookies.forEach((item) => {
      let val = item.split('=');
      hash[val[0]] = val[1];
    })
    let sessionId = hash['login_email'];
    let foundUser;
    let users = JSON.parse(fs.readFileSync('./db/users'));
    users.forEach((item) => {
      if(item.email === sessions[sessionId]){
        foundUser = item;
      }
    })
    if(foundUser){
      console.log(1)
      str = str.replace('__password__',foundUser.password)
    }else{
      str = str.replace('__password__','不知道')

    }
    res.write(str);
    res.end();
  }else if(path === '/logout'  && method === 'post'){
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json;utf-8');
    let cookies = req.headers.cookie === undefined ? [] : req.headers.cookie.split('; ');
    let hash = {};
    cookies.forEach((item) => {
      let val = item.split('=');
      hash[val[0]] = val[1];
    })
    let sessionId = hash['login_email'];
    res.setHeader('Set-Cookie',`login_email=${sessionId};Version=1;max-age=0`);
    res.write(`
      {
        "success":"ok"
      }
    `);
    res.end();
  }else if(path === '/login' && method === 'get'){
    res.statusCode = 200;
    let str = fs.readFileSync('./login.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.write(str);
    res.end();
  }else if(path === '/login' && method === 'post'){
    readBody(req)
      .then((data) => {
        let hash = {};
        let arr = data.split('&');
        arr.forEach((key) => {
          let val = key.split('=');
          hash[val[0]] = decodeURIComponent(val[1])
        })
        let {email,password} = hash;
        if(email.indexOf('@') === -1 || email.length === 0){
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "email" : "邮箱格式错误"
            }
          }`)
        }else if(password.length === 0){
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "password" : "密码必填"
            }
          }`)
        }else {
          let user = fs.readFileSync('./db/users','utf-8');
          try{
            user = JSON.parse(user);
          }catch(exception){
            user = [];
          }
          let isExit = false;
          let isCorrect = false;
          for(let i = 0 ;i<user.length;i++){
            if(user[i].email === email && user[i].password === password){
              isExit = true;
              isCorrect = true;
            }else if(user[i].email === email && user[i].password != password){
              isExit = true;
              isCorrect = false;
            }
          }
          res.setHeader('Content-Type','application/json;utf-8');
          if(isExit && isCorrect){
            //用户名密码正确
            res.statusCode = 200;
            let sessionId = Math.random() * 100000;
            sessions[sessionId] = email;
            res.setHeader('Set-Cookie',`login_email=${sessionId};Version=1;max-age=360000`);
            res.write(`{
              "data":{
                "success":"登录成功"
              }
            }`)
          }else if(isExit && !isCorrect){
            //用户名密码错误
            res.statusCode = 401;
            res.write(`{
              "errors":{
                "check":"账号密码不匹配"
              }
            }`)
          }else{
            //用户不存在
            res.statusCode = 401;
            res.write(`{
              "errors":{
                "check":"用户不存在"
              }
            }`)
          }
          
        }
        res.end();
      })
  }else if(path === '/register' && method === 'get'){
    res.statusCode = 200;
    let str = fs.readFileSync('./register.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.write(str);
    res.end();
  }else if(path === '/register' && method === 'post'){
    readBody(req)
      .then((data) => {
        console.log(data);
        let hash = {};
        let arr = data.split('&');
        arr.forEach((key) => {
          let val = key.split('=');
          hash[val[0]] = decodeURIComponent(val[1])
        })
        let {email,password,password_confirmation} = hash;
        console.log(email)
        console.log(password)
        console.log(password_confirmation)
        if(email.indexOf('@') === -1 || email === ''){
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "email" : "邮箱格式错误"
            }
          }`)
        }else if(password === ''){
          res.statusCode =400 ;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "password" : "密码错误"
            }
          }`)
        }else if(password_confirmation != password){
          console.log(111)
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "confirm" : "密码不一致"
            }
          }`)
        }else {
          res.setHeader('Content-Type','application/json;utf-8');
          //将数据写入数据库
          let user = fs.readFileSync('./db/users','utf-8');
          try{
            user = JSON.parse(user)
          }catch(exception){
            user = []
          }
          let isInUse = false;
          for(let i = 0;i<user.length;i++){
            if(user[i].email === email){
              isInUse = true;
            }
          }
          if(isInUse){
            //邮箱被占用
            res.statusCode = 400;
            res.write(`{
              "errors":{
                "email":"邮箱被占用"
              }
            }`)
          }else{
            res.statusCode = 200;
            res.write(`{
              "success":"ok"
            }`)
            let newUser = {
              "email": email,
              "password":password
            }
            user.push(newUser);
            let users = JSON.stringify(user);
            fs.writeFileSync('./db/users',users);
          }
          
        }
        res.end();
      })
  }else if(path === '/style.css'){
    console.log(req.headers)
    let str = fs.readFileSync('./style.css','utf-8');
    res.setHeader('Content-Type','text/css;charset=utf-8');
    let fileMd5 = md5(str);                                 // 针对 base.css 文件生成 md5 值
    if(req.headers['if-none-match'] === fileMd5){
      res.statusCode = 304;
    }else{
      res.setHeader('ETag',fileMd5);                          // 通过 ETag 将 md5 值传递到客户端，此时客户端收到响应会在
      res.statusCode = 200;
      res.write(str);
    }
    res.end();
  }else if(path === '/main.js'){
    res.statusCode = 200;
    let str = fs.readFileSync('./main.js','utf8');
    res.setHeader('Content-Type','application/javascript');
    res.write(str);
    res.end();
  }else if(path === '/xxx'){
    res.statusCode = 200;
    res.setHeader('Content-Type','text/xml');
    res.setHeader('Access-Control-Allow-Origin','http://winter.com:8002')
    let str = `
      {
        "to":"Tove",
        "from":"Jani",
        "heading":"Reminder",
        "body":"Don't forget me this weekend!"
      }
    `;
    res.write(str);
    res.end();
  }else{
    res.statusCode = 400;
    res.write('呜呜呜'); 
    res.end();
  }
})
server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n打开 http://localhost:" +
    port
);

function readBody(request){
  let body = [];
  return new Promise((resolve,reject) => {
    request.on('data',(chunk) => {
      body.push(chunk);
    }).on('end',() => {
      body = Buffer.concat(body).toString();
      console.log(body)
      resolve(body);
    })
  })
}