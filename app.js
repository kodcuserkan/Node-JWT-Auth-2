require("dotenv").config();
// eslint-disable-next-line import/no-extraneous-dependencies
const express = require("express");

const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 4000;

const MyKey = process.env.MY_SECRET_KEY;

const cors = require("cors");

const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());

const USERS = require("./users.json");

const VerifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ")[1];
    req.token = bearer;
    next();
  } else {
    res.sendStatus(403);
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "İsim market api",
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API giriş sayfası",
  });
});

app.get("/api/userlist", VerifyToken, (req, res) => {
  jwt.verify(req.token, MyKey, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "API users list",
        USERS,
        authData,
      });
    }
  });
});

app.post("/api/posts", VerifyToken, (req, res) => {
  jwt.verify(req.token, MyKey, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "Post oluşturuldu",
        authData,
      });
    }
  });
});

const isUserExists = async (password, username, userlist) => {
  let exists;
  if (userlist.some((x) => x.email === username && x.password === password)) {
    exists = true;
  } else {
    exists = false;
  }
  console.log("exist", exists);
  return exists;
};

app.post("/api/login", async (req, res, next) => {
  const { password, username } = req.body;
  const UserExists = await isUserExists(password, username, USERS.users);
  console.log(UserExists);
  if (UserExists === true) {
    const user = {
      user: {
        email: username,
        password,
      },
    };
    jwt.sign({ user }, MyKey, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        res.json({
          message: "Bir hata oluştu",
          status: 403,
        });
      } else {
        res.json({
          message: "Başarılı giriş",
          token,
          status: 200,
        });
      }
    });
  } else {
    res.send({
      message: "Hatalı kullanıcı adı veya parola",
      status: 403,
    });
  }
  next();
});

app.listen(PORT, () => console.log("App", PORT, "Portunda Yayında!"));
