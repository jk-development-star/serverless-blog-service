const getUserDetails = require("./userUtility");

const combineUserAndBlogData = async (blogsData, token) => {
  const blogsWithUserDetails = [];
  const blogs = Array.isArray(blogsData) ? blogsData : [blogsData];
  for (const blog of blogs) {
    if (blog.author_details) {
      const { _id: userId, ...userWithoutId } = await getUserDetails(
        blog.author_details,
        token
      );
      const combinedData = {
        ...blog._doc,
        ...userWithoutId,
      };
      delete combinedData.author_details;
      blogsWithUserDetails.push(combinedData);
    } else {
      blogsWithUserDetails.push(blog._doc);
    }
  }
  return Array.isArray(blogsData)
    ? blogsWithUserDetails
    : blogsWithUserDetails[0];
};

module.exports = combineUserAndBlogData;
