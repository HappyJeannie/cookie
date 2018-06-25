var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.env.PORT || 8888;

var server = http.createServer((req,res)=>{
  let temp = url.parse(req.url,true);
  let path = temp.pathname;
  let query = temp.query;
  let method = req.method;

  if(path === '/'){
    res.statusCode = 200;
    let str = fs.readFileSync('./index.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.write(str);
    res.end();
  }else if(path === '/favicon.ico'){
    res.statusCode = 200;
    let str = fs.readFileSync('./favicon.ico','utf8');
    res.setHeader('Content-Type','image/png');
    res.write(str);
    res.end();
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
  }else if(path === '/register'){
    res.statusCode = 200;
    let str = fs.readFileSync('./register.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.write(str);
    res.end();
  }else if(path === '/login'){
    res.statusCode = 200;
    let str = fs.readFileSync('./login.html','utf8');
    res.setHeader('Content-Type','text/html;charset=utf-8');
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
