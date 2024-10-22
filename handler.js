const dotnev = require("dotenv");
dotnev.config();
const Blog = require("./src/model/blog");
const connectDB = require("./src/config/db.config");
const getAuthDetails = require("./src/utils/utility");
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);
const AWS = require("aws-sdk");
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
    const blog = await Blog.create(blogData);
    if (blog) {
      const sns = new AWS.SNS();
      const blogMessage = {
        Message: JSON.stringify(blog.name, blog.category),
        TopicArn: process.env.SNS_TOPIC_ARN,
      };
      const result = await sns.publish(blogMessage).promise();
      console.log("SNS Result", result);
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

module.exports.processBlogQueue = async (event) => {
  try {
    const records = event.Records;
    for (const record of records) {
      const blogMessage = JSON.parse(record.body);
      console.log("Message", blogMessage);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Blog queue processed successfully!" }),
    };
  } catch (error) {
    console.log("Error", error.message);
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

module.exports.getBlogById = async (event) => {
  const { role, token, userId } = await getAuthDetails(event);
  const { id } = event.pathParameters;
  try {
    if (role === "admin") {
      const blog = await Blog.findOne(id, { __v: 0, updatedAt: 0 });
      const blogsWithUserDetails = await combineUserAndBlogData(blog, token);
      if (blog) {
        return {
          statusCode: 200,
          body: JSON.stringify(blogsWithUserDetails),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Blog not found" }),
        };
      }
    } else {
      const blog = await Blog.findOne(
        { _id: id, author_details: userId },
        { __v: 0, updatedAt: 0 }
      );
      const blogsWithUserDetails = await combineUserAndBlogData(blog, token);
      if (blog) {
        return {
          statusCode: 200,
          body: JSON.stringify(blogsWithUserDetails),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Blog not found" }),
        };
      }
    }
  } catch (error) {
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};

module.exports.deleteBlog = async (event) => {
  const { role, userId } = await getAuthDetails(event);
  const { id } = event.pathParameters;
  try {
    const blog = await Blog.findOne(id);
    if (!blog) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Blog not found" }),
      };
    }
    if (blog.author_details.toString() !== userId && role !== "admin") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not authorized to delete this blog.",
        }),
      };
    }
    const deleteBlog = Blog.findOneAndDelete({ _id: id });
    if (deleteBlog) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Blog deleted successfully!" }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Blog not found or you are not author of this blog",
        }),
      };
    }
  } catch (error) {
    console.log("Error", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error!" }),
    };
  }
};
