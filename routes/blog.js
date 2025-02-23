const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;


const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve(`./public/uploads/`));
//   },
//   filename: function (req, file, cb) {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });

// Set up Cloudinary storage for image uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_images", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('createdBy');
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    // coverImageURL: `/uploads/${req.file.filename}`,
    coverImageURL: req.file.path,
  });
  return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
