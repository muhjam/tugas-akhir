const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient(
  "https://devcodeai.openai.azure.com/", 
  new AzureKeyCredential("cc6fbbeb2a99477caff36a3561413c0f")
);

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
    const prompt = generatePrompt(text);
    const { id, created, choices, usage } = await client.getChatCompletions(
      "gpt35turbo",
      prompt,
      '2023-07-01-preview'
    );

    res.status(200).json({ result: choices[0].message.content });
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
  const systemPrompt = `
      You are a virtual assistant tasked with generating competitive programming challenges. Your task is to respond with a validated JSON format containing the title, task description, and examples of the challenge. The challenges will be in Bahasa Indonesia. For each challenge, you must provide a minimum of 4 positive test cases as well as include two simple test cases along with the step-by-step solution to the related case. Also, note that for each challenge that you generate, please limit the data type to primitive only (integer, boolean, string, and/or array). Please provide a clear and functional code example in TypeScript, including comments and meaningful variable names. Make sure to use a straightforward function name.

      RULES FOR YOU:
      - Don't give the user random result examples like 'acak isi array' because in our program tests must check if the result is consistent.
      - Follow the pattern that I give to you.
      - You cannot create a function without parameters such as 'totalEpisode()'. You can change this to 'totalEpisode(seasons: array)' or 'totalEpisode(season1: number, season2: number)' or whatever you want and connect it to the context of the quest.
      - Information in parameters must be complex, not simple.
      - You can be creative but you must follow the pattern that I give to you.
      - The context with the title must clearly match what it's going to be.

      After you generate test cases for each challenge, check the number of test cases that you have generated. If the number is less than 4, automatically add additional test cases with relevant input and output values to ensure there are at least 4 test cases. Please also check that the test cases do not have any empty values. If there are empty values, please remove them and change them to new test cases.

      For the primitive data types, please note as below:
      - For strings, enclose string values within double quotation marks.
      - For integers, simply provide the numeric value without any quotation marks.
      - For float, simply provide the numeric value without any quotation marks using '.' as the decimal separator.
      - For boolean, use the keywords 'true' or 'false' without any quotation marks.
      - For arrays, enclose the array values within square brackets, with each value separated by a comma.
      - For arrays, the values can only be primitive data types (integer, float, boolean, or string). For example: array of integer: [1, 2, 3, 4, 5], array of strings: ['apple', 'banana', 'cherry', 'durian', 'eggplant'], array of boolean: [true, false, true, false, true], array of float: [3.14, 2.71, 1.41, 1.61, 1.73].

      To ensure appropriate difficulty levels for the questions, categorization into easy, medium, and hard is crucial, based on the user's needs. If the user's preference is not specified, the default option is to randomize the difficulty level among these three categories.

      In addition, it's worth considering that the length of the question description and the length of function implementation also play a major role in determining the difficulty level. Typically, harder questions tend to have longer descriptions and longer function implementations, providing more complex requirements and requiring a greater level of comprehension and logic analysis to solve. This correlation between question difficulty, description length, and function implementation length can further aid in categorizing questions accurately.
    `
  
  // Create an array of message objects with roles and content
  const messages = [
    {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Buat soal sisa bagi dua bilangan",
        },
        {
           role: "assistant",
          content: `[\n    {\n        \"title\": \"Sisa Bagi Dua Bilangan\",\n        \"description\": \"**Nama Soal**: Sisa Bagi Dua Bilangan.\\n\\n **Deskripsi**: Challenge ini akan menguji kemampuanmu dalam menghitung sisa bagi (modulo) dari dua bilangan. Kamu akan diberikan dua bilangan integer, dan tugasmu adalah menghitung sisa bagi dari bilangan pertama dibagi dengan bilangan kedua. \\n\\n**Aturan**\\n- Buatlah sebuah function dengan nama sisaBagi yang menerima dua parameter: bilangan1 (integer) dan bilangan2 (integer).\\n-  Function harus mengembalikan nilai berupa bilangan bulat sisa bagi dari bilangan pertama dibagi dengan bilangan kedua (integer).\\n\\n**Contoh Kasus**:\\n-  Kita ambil kasus dimana parameter input bernilai 7 dan 3. Dalam kasus ini, hasil yang diperoleh adalah 1. Hasil ini didapatkan dari sisa bagi 7 dibagi dengan 3.\\n- Kita ambil kasus dimana parameter input bernilai 12 dan 5. Dalam kasus ini, hasil yang diperoleh adalah 2. Hasil ini didapatkan dari sisa bagi 12 dibagi dengan 5.\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"integer\"\n            },\n            {\n                \"name\": \"bilangan2\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 7,\n                    \"bilangan2\": 3\n                },\n                \"expectedValue\": 1\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 12,\n                    \"bilangan2\": 5\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 10,\n                    \"bilangan2\": 3\n                },\n                \"expectedValue\": 1\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 10,\n                    \"bilangan2\": 50\n                },\n                \"expectedValue\": 10\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function sisaBagi(bilangan1: number, bilangan2: number): number { return bilangan1 % bilangan2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"sisaBagi\"\n        }\n    }\n]`,
        },
        {
          role: "user",
          content:
            "Pembagian Dua Bilangan",
        },
        {
           role: "assistant",
          content: `[\n    {\n        \"title\": \"Pembagian Dua Bilangan\",\n        \"description\": \"**Nama Soal**: Pembagian Dua Bilangan.\\n\\n**Deskripsi**: Challenge ini akan menguji kemampuanmu dalam melakukan pembagian dua bilangan. Kamu akan diberikan dua bilangan integer, dan tugasmu adalah membagi bilangan pertama dengan bilangan kedua untuk menghasilkan nilai yang benar.\\n\\n**Aturan**\\n- Buatlah sebuah function dengan nama pembagian yang menerima dua parameter: bilangan1 (float) dan bilangan2 (float).\\n- Function harus mengembalikan nilai berupa bilangan bulat hasil pembagian bilangan pertama dengan bilangan kedua (integer).\\n\\n**Contoh Kasus**:\\n- Kita ambil kasus dimana parameter input bernilai 10.0 dan 2.0. Dalam kasus ini, hasil yang diperoleh adalah 5.0. Hasil ini didapatkan dengan melakukan pembagian bilangan pertama (10.0) dengan bilangan kedua (2.0).\\n-  Kita ambil kasus dimana parameter input bernilai 15.0 dan 5.0. Dalam kasus ini, hasil yang diperoleh adalah 3.0. Hasil ini didapatkan dengan melakukan pembagian bilangan pertama (15.0) dengan bilangan kedua (5.0).\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"float\"\n            },\n            {\n                \"name\": \"bilangan2\",\n                \"typeData\": \"float\"\n            }\n        ],\n        \"expectedTypeData\": \"float\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 10.0,\n                    \"bilangan2\": 2.0\n                },\n                \"expectedValue\": 5.0\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 15.0,\n                    \"bilangan2\": 5.0\n                },\n                \"expectedValue\": 3.0\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 1.0,\n                    \"bilangan2\": 1.0\n                },\n                \"expectedValue\": 1.0\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 100.0,\n                    \"bilangan2\": 50.0\n                },\n                \"expectedValue\": 2.0\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function pembagian(bilangan1: number, bilangan2: number): number { return bilangan1 / bilangan2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"pembagian\"\n        }\n    }\n]`,
    },
      {
        role: "user",
        content: prompt,
      },
  ];

  return messages;
}
