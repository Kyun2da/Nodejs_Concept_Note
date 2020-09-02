const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");

const app = express();
app.set("port", process.env.PORT || 3000);

// 개발할때는 dev, 배포할때는 combined 사용
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // true면 qs, false면 querystring  : 일반적으로 true를 추천 qs가 훨씬좋다.
// 미들웨어는 next()를 해야지만 아래로 내려간다.
app.use(
  (req, res, next) => {
    console.log("모든 요청에 다 실행됩니다.");
    next();
  },
  (req, res, next) => {
    try {
      next();
      //console.log(asdasdg);
    } catch (error) {
      next(error);
    }
  }
);

// res sendFile, send, json 세개 중에 하나만 써야한다.
//여러개를 같이쓰면 에러가난다. 이 세개중에 하나쓰고 뒤에 writeHead도 쓰면 안됨
app.get("/", (req, res) => {
  //res.send("Hello, Express");
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

app.use((req, res, next) => {
  console.error("404 에러입니다.");
  res.send("404 에러입니다.");
});

// 에러 미들웨어 : 반드시 파라미터가 4개가 있어야함
app.use((err, req, res, next) => {
  console.error("에러가 났는데 오류 안알려줄거에요");
  res.send("알수 없는 에러입니다 관리자에게 문의하세요");
});
