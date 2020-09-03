const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const indexRouter = require("./routes");
const userRouter = require("./routes/user");

const app = express();
app.set("port", process.env.PORT || 3000);

// 개발할때는 dev, 배포할때는 combined 사용
app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // true면 qs, false면 querystring  : 일반적으로 true를 추천 qs가 훨씬좋다.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  })
);

const multer = require("multer");
const fs = require("fs");

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, //5메가바이트의 사이즈까지만 허용
});
app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});
app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("ok");
});

app.use("/", indexRouter);
app.use("/user", userRouter);

// res sendFile, send, json 세개 중에 하나만 써야한다.
//여러개를 같이쓰면 에러가난다. 이 세개중에 하나쓰고 뒤에 writeHead도 쓰면 안됨
app.get(
  "/",
  (req, res, next) => {
    console.log("GET / 요청에서만 실행됩니다.");
    next();
  },
  (req, res) => {
    throw new Error("에러는 에러 처리 미들웨어로 갑니다.");
  }
);

// 에러처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
