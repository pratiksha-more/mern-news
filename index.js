import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import News from "./models/newsModel.js";

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

async function connectToDatabase() {
  await mongoose.connect("mongodb://localhost:27017/News");
  console.log("Connected to database");
}

connectToDatabase();

app.get("/", async (req, res) => {
  const allNews = await News.find();
  res.render("index", { allNews });
});

app.get("/upload", async (req, res) => {
  const { id } = req.query;
  const allNews = await News.find();

  if (id) {
    const news = await News.findById(id);
    return res.render("upload", { allNews, record: news });
  }
  return res.render("upload", { allNews, record: null });
});

app.get("/news/:id", async (req, res) => {
  const { id } = req.params;
  const news = await News.findById(id);
  res.render("news", { news });
});

app.post("/upload", async (req, res) => {
  const { headline, fullnews } = req.body;
  const { id } = req.query;

  if (id) {
    const news = await News.findByIdAndUpdate(id, {
      headline,
      content: fullnews,
    });
    return res.redirect("/upload");
  }
  await News.create({
    headline,
    content: fullnews,
  });
  return res.redirect("/upload");
});

app.get("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await News.findByIdAndDelete(id);
  res.redirect("/upload");
});
app.get("/update/:id", async (req, res) => {
  const { id } = req.params;
  await News.findByIdAndDelete(id);
  res.redirect("/upload");
});

app.get("/search", async (req, res) => {
  const { key } = req.query;

  const results = await News.find({
    $or: [
      { headline: { $regex: key, $options: "i" } }, // case-insensitive search in title
      { content: { $regex: key, $options: "i" } }, // case-insensitive search in content
    ],
  });

  res.render("index", { allNews: results });
});

app.listen(3000, () => {
  
  console.log("Server is running on port 3000");
});
