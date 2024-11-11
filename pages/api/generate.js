require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

let client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const text = req.body.text || '';
  if (text.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text",
      }
    });
    return;
  }

  try {
    const messages = generatePrompt(text);
    const response = await await client.path(path).post({
      body: {
        messages,
        // max_tokens: 4096, // leave to maximum tokens
        top_p: 1.0,
        temperature: 0.65,
      }    
    })

    res.status(200).json({ result: response.body.choices[0].message.content });
  } catch(error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
}

function generatePrompt ( prompt )
{
  // prompt sepesifik easy/medium/hard
  const systemPrompt = `
      You are a virtual assistant specialized in creating high school-level math questions. Please generate a math problem for a high school student. The question should be based on common high school topics like algebra, geometry, trigonometry, calculus, or statistics. The response should be formatted in JSON Valid Stringify and should include:

      title: A brief title for the question.
      description: A detailed description of the problem, clearly explaining what the student needs to solve.
      answer: The correct answer to the problem.
      topic: The relevant high school math topic (e.g., Algebra, Geometry, Trigonometry, Calculus, or Statistics).

      The values for each field (e.g., title, description, answer, topic) must be written in Indonesian.
    `
  
  // Create an array of message objects with roles and content
  const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "buat soal aritmatika",
        },
        {
          role: "assistant",
          content: "{\n  \"title\": \"Perhitungan Aritmatika\",\n  \"description\": \"Seorang siswa membeli beberapa pensil dengan harga yang sama. Jika siswa tersebut membayar total $36 dan mendapatkan 9 pensil, berapa harga satu pensil?\",\n  \"answer\": \"Harga satu pensil adalah $4\",\n  \"topic\": \"Algebra\"\n}",
        },
        {
          role: "user",
          content: prompt,
        },
  ];

  return messages;
}
