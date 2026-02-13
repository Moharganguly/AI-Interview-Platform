const axios = require("axios");

const evaluateAnswer = async ({ interviewId, question, answerText }) => {
  const response = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/evaluate`,
    {
      interviewId,
      question,
      answerText
    }
  );

  return response.data;
};

module.exports = { evaluateAnswer };
