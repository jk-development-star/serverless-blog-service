const dotnev = require("dotenv");
dotnev.config();
const Blog = require("./src/model/blog");
const connectDB = require("./src/config/db.config");
const getAuthDetails = require("./src/utils/utility");
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);
const validationError = require("./src/middleware/validationError");
const combineUserAndBlogData = require("./src/utils/combineBlogs");

module.exports.addNewBlog = async (event) => {
  const authId = await getAuthDetails(event);
  console.log(authId);
  const input = JSON.parse(event.body);
  const author_details = authId.userId;
  try {
    const blogData = {
      name: input.name,
      category: input.category,
      article: input.article,
      author_details: author_details,
    };
    console.log(blogData);
    const blog = await Blog.create(blogData);
    if (blog) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Blog created successfully!!",
        }),
      };
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: validationError(error) }),
      };
    }
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};

module.exports.getAllBlogs = async (event) => {
  const { role, token, userId } = await getAuthDetails(event);
  const query = role === "admin" ? {} : { author_details: userId };
  try {
    const blogs = await Blog.find(query, { __v: 0, updatedAt: 0 }).sort({
      createdAt: -1,
    });
    const blogsWithUserDetails = await combineUserAndBlogData(blogs, token);
    return {
      statusCode: 200,
      body: JSON.stringify(blogsWithUserDetails),
    };
  } catch (error) {
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};
