const { Schema, model } = require("mongoose");

const blogSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 20,
  },
  category: {
    type: String,
    required: true,
    minlength: 20,
  },
  article: {
    type: String,
    required: true,
    minlength: 1000,
  },
  author_details: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = model("Blog", blogSchema);
module.exports = Blog;
