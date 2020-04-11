var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');

router.get('/', function(request, response){
  
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    // html 코드를 가져온다. 변수를 주입한다. 
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:400px; display:block; margin-top:10px">`,
      `<a href="/topic/create">create</a>`
    );
    response.send(html);
  
  });

module.exports = router;
  
  