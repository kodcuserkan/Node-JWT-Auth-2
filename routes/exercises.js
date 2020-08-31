/* eslint-disable no-param-reassign */
const router = require("express").Router();
const Exercise = require("../models/exercise.model");

router.route("/").get((req, res) => {
  Exercise.find()
    .then((exercises) => res.json(exercises))
    .catch((err) => res.status(400).json("Hata: ", err));
});

router.route("/add").post((req, res) => {
  const { username } = req.body;
  const { description } = req.body;
  const { duration } = req.body;
  const { date } = req.body;

  const newExercise = new Exercise({
    username,
    description,
    duration,
    date,
  });
  newExercise
    .save()
    .then(() => res.json("Egzersiz eklendi!"))
    .catch((err) => res.status(400).json("Hata: ", err));
});

router.route("/:id").get((req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => res.json(exercise))
    .catch((err) => res.status(400).json("Hata: ", err));
});

router.route("/:id").delete((req, res) => {
  Exercise.findByIdAndDelete(req.params.id)
    .then(() => res.json("Egzersiz silindi!"))
    .catch((err) => res.status(400).json("Hata: ", err));
});

router.route("/update/:id").post((req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => {
      exercise.username = req.body.username;
      exercise.description = req.body.description;
      exercise.date = Date.parse(req.body.date);
      exercise.duration = Number(req.body.duration);

      exercise
        .save()
        .then(() => res.json("Egzersiz update edildi"))
        .catch((err) => res.status(400).json("Hata: ", err));
    })
    .catch((err) => res.status(400).json("Hata: ", err));
});

module.exports = router;
