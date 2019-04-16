const express = require("express");
const methodOverRide = require("method-override");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
// APP CONFIG
mongoose.connect("mongodb://localhost:27017/my-blog", {
  useNewUrlParser: true
});
mongoose.set("useFindAndModify", false);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); // It should be after 'bodyParser'
app.use(methodOverRide("_method"));

// MONGOOSE MODEL CONFIG
let blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

let Blog = mongoose.model("Blog", blogSchema);
// RESTFUL ROUTES
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
  Blog.find({}, (err, blogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});
// NEW ROUTE
app.get("/blogs/new", (req, res) => {
  res.render("new");
});
// CREATE ROUTE
app.post("/blogs", (req, res) => {
  // create blog
  // console.log("Hereeeee.....", req.body);
  console.log(req.body);
  console.log("=================");
  req.body.blog.body = req.sanitize(req.body.blog.body);

  console.log(req.body);

  Blog.create(req.body.blog, (err, newBlog) => {
    if (err) {
      res.render("new");
    } else {
      //   console.log(newBlog);
      //   res.render("");
      res.redirect("/blogs");
    }
  });
  // redirect to the index
});
// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});
// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      console.log("ERRRRRRRRRROR", err);
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if (err) {
      console.log("aaaaaa", err);
      // res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});
// DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
  Blog.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log("............", err);
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
  // res.send("Destroy Route");
});
app.listen(3000, () => {
  console.log("The Blog Server Has Started!!!!");
});
