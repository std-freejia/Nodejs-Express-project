var express = require('express');
var router = express.Router();

var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var fs = require('fs');
var template = require('../lib/template.js');

// main.js 에서 app.use('/topic', topicRouter); 로 위임받았으므로,
// 이 안의 라우터에서는 '/topic' 을 생략한다. 
// '/topic/create' -> '/create'

//  /topic/create은, /topic/:pageId 보다 앞에 와야 하는 라우팅이다. 
router.get('/create', function(request, response){
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
    `, '');
    response.send(html);
    });
  
  // '글 생성' POST를 처리 
  router.post('/create_process', function(request, response){
    console.log(request.list);
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/topic/${title}`);
    });
  });
  
    
  
  // 수정 페이지
  router.get('/update/:pageId', function(request, response){
  
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`
      );
      response.send(html);
    });
  });
  
  // 수정 처리 
  router.post('/update_process', function(request, response){
      var post = request.body;
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          // response.writeHead(302, {Location: `/?id=${title}`});
          // response.end();
          response.redirect(`/topic/${title}`); //express()가 제공하는 리다이렉트
        })
      });
  
  })
  
  
  // 삭제 처리 
  router.post('/delete_process', function(request, response){
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      response.redirect('/');
    })
  
  });
  
router.get('/:pageId', function(request, response){

    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){

        if(err){ // 에러 처리 
        next(err);
        // next() 또는 next('value') : 모두 정상적인 것이다. 
        // next(err) : 비정상. 에러 넘김.
        }else{ // 정상처리
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`
        );
        response.send(html);
        }
        
    });

});
  
module.exports = router;
  