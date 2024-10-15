const axios = require("axios");
const getUserDetails = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.get(
      `https://4gcn0aclr9.execute-api.us-east-1.amazonaws.com/dev/get-user-details/${userId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
module.exports = getUserDetails;
