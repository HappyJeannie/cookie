var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.env.PORT || 8888;

var server = http.createServer((req,res)=>{
  let temp = url.parse(req.url,true);
  let path = temp.pathname;
  let query = temp.query;
  let method = req.method.toLowerCase();

  if(path === '/'){
    res.statusCode = 200;
    let str = fs.readFileSync('./index.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.write(str);
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
        console.log(data);
        let hash = {};
        let arr = data.split('&');
        arr.forEach((key) => {
          let val = key.split('=');
          hash[val[0]] = decodeURIComponent(val[1])
        })
        let {email,password} = hash;
        if(email.indexOf('@') === -1 || email === ''){
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "email" : "email is wrong"
            }
          }`)
        }else if(password === ''){
          res.statusCode === 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "password" : "password is wrong"
            }
          }`)
        }else {
          res.statusCode = 200;
          res.write(`{
            "success":"ok"
          }`)
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
              "email" : "email is wrong"
            }
          }`)
        }else if(password === ''){
          res.statusCode =400 ;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "password" : "password is wrong"
            }
          }`)
        }else if(password_confirmation != password){
          console.log(111)
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json;utf-8');
          res.write(`{
            "errors":{
              "confirm" : "passwords is not same"
            }
          }`)
        }else {
          console.log('222')
          res.statusCode = 200;
          res.write(`{
            "success":"ok"
          }`)
          //将数据写入数据库
          let user = JSON.parse(fs.readFileSync('./db/users'));
          let newUser = {
            "email":
          }

        }
        res.end();
      })
  }else if(path === '/style.css'){
    res.statusCode = 200;
    let str = fs.readFileSync('./style.css','utf8');
    res.setHeader('Content-Type','text/css');
    res.write(str);
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