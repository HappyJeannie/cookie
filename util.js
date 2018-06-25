export default{
  readBody(request){
    let body = [];
    return new Promise((resolve,reject) => {
      request.on('data',(chunk) => {
        body.push(chunk);
      }).on('end',() => {
        body = Buffer.concat(body).toString();
        resolve(body);
      })
    })
  },
  fomatData(data){
    return new Promise((reslove,reject) => {
      let hash = {};
      let arr = data.split('&');
      arr.forEach((key) => {
        let val = key.split('=');
        hash[val[0]] = val[1]
      })
      reslove(hash);
    })
  }
}