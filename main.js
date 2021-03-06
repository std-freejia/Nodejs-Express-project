var express = require('express');
var app = express();
var fs = require('fs');
var compression = require('compression')
var bodyParser = require('body-parser');
// 단골 보안 이슈를 해결해주는 helmet
var helmet = require('helmet');
var port = 3000;

// 라우팅 파일 가져오기 
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');

app.use(helmet());

// public 디렉토리 안에서 정적 파일을 찾겠다고 선언. 정적  파일을 url 을 통해 접근 가능.
app.use(express.static('public'))

// bodyParser 미들웨어 : 사용자가 전송한 POST 데이터를 분석하여 제공.
// app.post() 의 콜백에서 request에 body라는 속성을 만들어낸다. 
app.use(bodyParser.urlencoded({extended: false}));
// 모든 응답을 압축
app.use(compression());

// 모든 response 에서 'list'라는 속성을 갖도록 해보자. 
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    // 모든 요청에 list 속성에 의해 글목록에 접근 가능해진다. 
    request.list = filelist;
    // next: 다음에 호출될 미들웨어를 실행하도록 명령. 
    next();
  });
});

app.use('/topic', topicRouter);
app.use('/', indexRouter);

// 잘못된 경로 에러 처리 (404)
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that !');
});
// 미들웨어는 순차적으로 라우터를 처리하기 때문에, 잘못된 경로는 마지막에 처리하도록 코딩한다.

// next(err) 를 통해 전달받은 err 라는 인자 가진다.
app.use(function(err, req, res, next) { // 에러 핸들러  // 404 뒤에 위치.
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, function(){
  console.log('Listening on Port 3000 !');
}); 
