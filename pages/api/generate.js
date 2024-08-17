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
  // prompt sepesifik easy/medium/hard
  const systemPrompt = `
      You are a virtual assistant tasked with generating competitive programming challenges. Your task is to respond with a validated JSON format containing the title, task name, and examples of the challenge. The challenges will be in Bahasa Indonesia. For each challenge, you must provide a minimum of 4 positive test cases as well as include two simple test cases along with the step-by-step solution to the related case. Also, note that for each challenge that you generate, please limit the data type to primitive only (integer, boolean, string, and/or array). Please provide a clear and functional code example in TypeScript, including comments and meaningful variable names. Make sure to use a straightforward function name.

      RULES FOR YOU:
      - Don't give the user a random result example like "acak isi array" because in our program, tests must check that the result is consistent.
      - Follow the pattern I give you.
      - In code, it must be solvable by the user.
      - Please make the content of 'Deskripsi' all about the main character's activities, the film's conflict, or storyline.
      - The content of 'Contoh Kasus' is all about the story, and the story you can make as long and creative as you can.
      - Don't create functions with fewer than 1 parameter, such as 'totalEpisode()'. You can change this to 'totalEpisode(seasons: array)' or 'totalEpisode(season1: number, season2: number)' or whatever you want and connect it to the context of the quest.
      - Information parameters must be complex, not simple, and the parameters must connect with the object in the story.
      - You can be creative, but you must follow the pattern I give you.
      - Be creative in 'Contoh Kasus,' and the value is supposed to have 2 conditions, not more or less. The value in the story should not say "fungsi" (function). A correct example is like "Pada ..., Andi berhasil ...., jadi..." and the second condition "pada..., Andi berhasil......, jadi....". If the parameter in 'Contoh Kasus' is like "namaDepan," change it to "nama depan." Don't write explicit data structures. For example, if 'season' is an array, don't explicitly state the data type or value like "season = [10,23,23]" or "array dalam season," but describe it in another way, like telling a story. The value in 'Contoh Kasus' must be complex, not simple.
      - If the output is a float then it can only be rounded to a maximum of two decimal places, make sure the generated code also handles rounding to two decimal digits.
      - Do not return null value.
      - Do not give array of objects.

      After you generate test cases for each challenge, check the number of test cases that you have generated. If the number is less than 4, automatically add additional test cases with relevant input and output values to ensure there are at least 4 test cases. Please also check that the test cases do not have any empty values. If there are empty values, please remove them and change them to new test cases.

      For primitive data types, please note the following:
      - For strings, enclose string values within double quotation marks.
      - For integers, simply provide the numeric value without any quotation marks.
      - For floats, simply provide the numeric value without any quotation marks using "." as the decimal separator.
      - For booleans, use the keywords "true" or "false" without any quotation marks.
      - For arrays, enclose the array values within square brackets, with each value separated by a comma.
      - For arrays, the values can only be primitive data types (integer, float, boolean, or string). For example:
      - array of integers: [1, 2, 3, 4, 5]
      - array of strings: ["apple", "banana", "cherry", "durian", "eggplant"]
      - array of booleans: [true, false, true, false, true]
      - array of floats: [3.14, 2.71, 1.41, 1.61, 1.73]

      A question is going to be a story, and the title should connect with the problem story. For the function name, don't specify what the function is for. For example, 'selisihJarak' implies subtraction but doesn't explicitly state 'pengurangan.'

      In addition, consider that the length of the question description and the length of function codeExample also play a major role in determining the difficulty level. Typically, harder questions tend to have longer descriptions and longer function codeExamples, providing more complex requirements and requiring a greater level of comprehension and logic analysis to solve. This correlation between question difficulty, description length, and function codeExample length can further aid in categorizing questions accurately.
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
            "Luffy vs Doflamingo",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Total Serangan Luffy\",\n        \"description\": \"**Nama Soal**: Total Serangan Luffy.\\n\\n**Deskripsi**: Ini adalah cerita tentang pertarungan epik antara Monkey D. Luffy, kapten Bajak Laut Topi Jerami, melawan Doflamingo, salah satu Shichibukai yang kuat. Pertarungan ini terjadi di Dressrosa, sebuah pulau yang dikuasai oleh Doflamingo. Dalam pertarungan ini, Luffy menggunakan berbagai macam serangan untuk melawan Doflamingo. Kamu adalah seorang perekrut programmer yang ingin menguji kemampuan calon programmer dengan membuat sebuah fungsi yang dapat menghitung total serangan yang dilakukan oleh Luffy selama pertarungan melawan Doflamingo.\\n\\n**Aturan**:\\n- Buatlah sebuah fungsi dengan nama 'totalSeranganLuffy' yang menerima satu parameter: seranganLuffy (array).\\n- Setiap elemen dalam array seranganLuffy merepresentasikan serangan yang dilakukan oleh Luffy (string).\\n- Fungsi ini harus mengembalikan nilai berupa total serangan yang dilakukan oleh Luffy (integer).\\n\\n**Contoh Kasus**:\\n- Dalam pertarungan pertama, terdapat serangan yang dilakukan oleh Luffy terdiri dari 'Gomu Gomu no Pistol', 'Gomu Gomu no Gatling', 'Gomu Gomu no Red Hawk', 'Gomu Gomu no Elephant Gatling', dan 'Gomu Gomu no Kong Gun' yang dilakukan oleh Luffy. Jadi total serangan yang dilakukan oleh Luffy adalah 5 serangan.\\n- Dalam pertarungan kedua, terdapat serangan yang dilakukan oleh Luffy terdiri dari 'Gomu Gomu no Pistol', 'Gomu Gomu no Gatling', dan 'Gomu Gomu no Red Hawk' yang dilakukan oleh Luffy. Jadi total serangan yang dilakukan oleh Luffy adalah 3 serangan.\",\n        \"inputSetup\": [\n            {\n                \"name\": \"seranganLuffy\",\n                \"type\": \"array\"\n            }\n        ],\n        \"outputType\": \"integer\",\n        \"testCase\": [\n            {\n                \"input\": [\n                    \"[\\\"Gomu Gomu no Pistol\\\", \\\"Gomu Gomu no Gatling\\\", \\\"Gomu Gomu no Red Hawk\\\", \\\"Gomu Gomu no Gatling\\\", \\\"Gomu Gomu no Kong Gun\\\"]\"\n                ],\n                \"expected\": 5\n            },\n            {\n                \"input\": [\n                    \"[\\\"Gomu Gomu no Pistol\\\", \\\"Gomu Gomu no Gatling\\\", \\\"Gomu Gomu no Red Hawk\\\"]\"\n                ],\n                \"expected\": 3\n            },\n            {\n                \"input\": [\n                    \"[\\\"Gomu Gomu no Pistol\\\", \\\"Gomu Gomu no Gatling\\\"]\"\n                ],\n                \"expected\": 2\n            },\n            {\n                \"input\": [\n                    \"[\\\"Gomu Gomu no Pistol\\\"]\"\n                ],\n                \"expected\": 1\n            }\n        ],\n        \"codeExample\": {\n            \"code\": \"function totalSeranganLuffy(seranganLuffy: string[]): number {\\n    return seranganLuffy.length;\\n}\",\n            \"language\": \"Typescript\",\n            \"function_name\": \"totalSeranganLuffy\"\n        },\n        \"topics\": \"programming, elementary grade, algorithm, mathematics\"\n    }\n]`,
        },
    {
          role: "user",
          content:
            "Menghitung jumlah karang yang dihancurkan oleh Plankton",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Total Karang yang Dihancurkan\",\n        \"description\": \"**Nama Soal**: Total Karang yang Dihancurkan.\\n\\n**Deskripsi**: Di dasar laut Bikini Bottom, terdapat sebuah makhluk jahat bernama Plankton. Plankton memiliki misi jahat untuk menghancurkan seluruh karang di lautan. Setiap kali Plankton berhasil menghancurkan satu karang, jumlah karang yang hancur bertambah. Sementara itu, Spongebob yang merupakan penduduk terbaik Bikini Bottom memiliki tugas untuk mencatat jumlah karang yang berhasil dihancurkan oleh Plankton setiap harinya. Plankton dan Spongebob membutuhkan bantuanmu untuk membuat sebuah fungsi yang dapat menghitung total karang yang telah dihancurkan oleh Plankton.\\n\\n**Aturan**:\\n- Buatlah sebuah fungsi dengan nama 'totalKarang' yang menerima dua parameter: karangTelahHancur (integer) dan karangDiHancurkan (integer).\\n- Fungsi ini harus mengembalikan nilai berupa total karang yang telah dihancurkan oleh Plankton (integer).\\n\\n**Contoh Kasus**:\\n- Pada hari pertama, Plankton berhasil menghancurkan 3 karang. Jadi total karang yang dihancurkan oleh Plankton pada hari pertama adalah 3 karang.\\n- Pada hari kedua, Plankton berhasil menghancurkan 5 karang. Jadi total karang yang dihancurkan oleh Plankton pada hari kedua adalah 8 karang.\",\n        \"inputSetup\": [\n            {\n                \"name\": \"karangTelahHancur\",\n                \"type\": \"integer\"\n            },\n            {\n                \"name\": \"karangDiHancurkan\",\n                \"type\": \"integer\"\n            }\n        ],\n        \"expectedType\": \"integer\",\n        \"testCase\": [\n            {\n                \"input\": [\n                    0,\n                    3\n                ],\n                \"expected\": 3\n            },\n            {\n                \"input\": [\n                    3,\n                    5\n                ],\n                \"expected\": 8\n            },\n            {\n                \"input\": [\n                    8,\n                    2\n                ],\n                \"expected\": 10\n            },\n            {\n                \"input\": [\n                    10,\n                    30\n                ],\n                \"expected\": 40\n            }\n        ],\n        \"codeExample\": {\n            \"code\": \"function totalKarang(karangTelahHancur: number, karangDiHancurkan: number): number {\\n return karangTelahHancur + karangDiHancurkan;\\n}\",\n            \"language\": \"Typescript\",\n            \"function_name\": \"totalKarang\"\n        },\n        \"topics\": \"programming, elementary grade, algorithm, mathematics, story\"\n    }\n]`,
    },
        {
          role: "user",
          content: prompt,
        },
  ];

  return messages;
}
