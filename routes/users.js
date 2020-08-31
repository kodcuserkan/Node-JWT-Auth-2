require("dotenv").config();

const router = require("express").Router();

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const User = require("../models/user.model");

const MyKey = process.env.MY_SECRET_KEY;

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: ", err));
});

router.route("/get-user").post(async (req, res) => {
  // console.log(req.body);
  await User.findOne(
    { username: req.body.username, password: req.body.password },
    (err, obj) => {
      const user = { username: req.body.username, password: req.body.password };
      console.log(obj);
      if (obj === null) {
        res.json({
          message: "Kullanıcı bulunamadı...",
          status: 403,
        });
      } else {
        jwt.sign({ user }, MyKey, { expiresIn: "7d" }, (err2, token) => {
          if (err2) {
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
      }
      if (err) {
        res.status(400).json("Hata: ", err);
      }
    }
  );
});

router.route("/add").post(async (req, res) => {
  const { username, password } = req.body;
  // console.log(username, password);
  await User.findOne({ username }, (err, obj) => {
    const user = { username, password };
    if (obj === null) {
      const newUser = new User(user);
      newUser
        .save()
        .then(() => {
          jwt.sign({ newUser }, MyKey, { expiresIn: "7d" }, (err1, token) => {
            if (err1) {
              res.json({
                message: "Bir hata oluştu",
                status: 403,
              });
            } else {
              res.json({
                message: "Kullanıcı eklendi!",
                token,
                status: 200,
              });
            }
          });
          // res.status(200).json({ message: "Kullanıcı eklendi!" });
        })
        .catch((err3) => res.status(400).json({ error: err3 }));
    } else {
      res.json({
        message: "Kullanıcı adı alınmış...",
        status: 403,
      });
    }
    if (err) {
      res.status(400).json({ Hata: err });
    }
  });
});

router.route("/change-password").post(async (req, res) => {
  const { username, password, newPass } = req.body;
  const isExists = await User.findOne(
    { username, password },
    async (err, obj) => {
      console.log(err, obj);
      if (err) {
        await res.status(400).json({
          status: 400,
          message: err,
        });
      } else if (obj === null) {
        await res.status(403).json({
          status: 403,
          message: "Kullanıcı bulunamadı / şifre hatalı",
        });
      }
    }
  );

  if (isExists !== null) {
    const filter = { username };
    const update = { password: newPass };
    const data = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    console.log(data);
    const MyNewUser = {
      username,
      newPass,
    };
    jwt.sign({ MyNewUser }, MyKey, { expiresIn: "7d" }, async (err1, token) => {
      if (err1) {
        res.json({
          message: "Bir hata oluştu",
          status: 403,
          hata: err1,
        });
      } else {
        res.status(200).json({
          status: 200,
          token,
          message: "Şifreniz başarılı bir şekilde değiştirilmiştir!",
        });
      }
    });
  }
});

router.route("/forget").post(async (req, res) => {
  const { username } = req.body;
  // const admin = "isim.market.boranka@gmail.com";
  const admin = process.env.ADMIN_MAIL;
  const adminPass = process.env.ADMIN_PSWRD;
  // console.log(username, password);
  await User.findOne({ username }, async (err, obj) => {
    if (err) {
      res.status(403).json({
        message: "Mail gönderirken hata oluştu",
      });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: admin,
        pass: adminPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const myHtml =
      obj &&
      `
      <b><center>Şifre Talebiniz Üzerine...</center></b><br/>
      <p>Tarafımıza yapılan şifre talebiniz için size ulaştık</p>
      <p><b>Kullanıcı mailiniz: </b> ${username}</p>
      <p><b>Şifreniz: </b>${obj.password}</p>
    `;

    const mailOptions = {
      from: admin,
      to: username,
      subject: "İsim Market Şifreniz",
      // text: `${username} için şifreniz: xxxxxx`,
      html: myHtml,
    };

    if (obj === null) {
      res.status(403).json({
        status: 403,
        message: `Kullanıcı bulanamadı!`,
      });
    } else {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Hata:", error);
        } else {
          console.log(username, err, obj);
          console.log(`Email sent: ${info.response}`);
          res.status(200).json({
            status: 200,
            message: info,
          });
        }
      });
    }
  });
});

module.exports = router;
