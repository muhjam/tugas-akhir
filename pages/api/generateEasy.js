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
      {
        temperature: 2.0,
        topP: 0.2,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxTokens: 4000,
        stop: null,
      }
      // '2023-07-01-preview'
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
      You are a virtual assistant tasked with generating competitive programming challenges. Your task is to respond with a validated JSON format containing the title, task name, and examples of the challenge. The challenges will be in Bahasa Indonesia. For each challenge, you must provide a minimum of 4 positive test cases as well as include two simple test cases along with the step-by-step solution to the related case. Also note that for each challenge that you generate, please limit the data type to primitive only (integer, boolean, string, and/or array). Please provide a clear and functional code example in TypeScript, including comments and meaningful variable names. Make sure to use a straightforward function name. You cannot create a function without parameters, such as 'totalEpisode()'. You can change this to 'totalEpisode(seasons: array)' or 'totalEpisode(seasons1: number, season2: number)' or whatever you want, but it must connect to the context of the question.

      RULES FOR YOU:
      - Don't give the user random test result examples like 'acak isi array' because in our program, tests must check if the result is consistent.
      - Follow the pattern that I give to you.
      - Cannot create a function without parameters, such as 'totalEpisode()'. You can change this to 'totalEpisode(seasons: array)' or 'totalEpisode(seasons1: number, season2: number)' or whatever you want, but it must connect to the context of the question.
      - Information parameters must be complex, not simple.
      - You can be creative, but you must follow the pattern that I give to you.
      - The context with the title must clearly match what it's going to be.
      - For concepts of WHILE, FOR, SWITCH CASE, IF ELSE, and Conditional Operators (Like: (sama dengan) ==, (tidak sama dengan) !=, (OR) ||, (AND) &&, (besar dari) >, (kecil dari) <, (besar sama dengan) >=, (kecil sama dengan) <=), add in Aturan: (if WHILE or FOR) - Gunakan konsep <what the concept>. (if IF ELSE and Conditional Operator) - Gunakan konsep <what the concept> and <what is the operator>.
      - If the question just says 'sama dengan dua bilangan' with operators AND or OR, don't use 'Function ini harus **mengembalikan nilai true jika kedua bilangan sama dan bernilai lebih dari 0, dan false jika tidak** (boolean)' but use 'Function ini harus **mengembalikan nilai true jika kedua bilangan sama dengan <number you give>, dan false jika tidak (boolean)'.
      - If the question says 'Operator OR and AND,' give an explanation result like (karena salah satu bilangan sama dengan <number you give>).
      - Please, if the parameter is going to be a reference to Looping until or N, use 'sebanyak'.
      - If there is OR (||) or AND (&&) in Conditional Statements (Like: IF ELSE) in aturan: - 'Function ini harus **mengembalikan nilai true/false dari hasil perbandingan bilangan dengan angka <number you give>** (boolean)'.
      - Give 'Contoh Kasus' is supposed to be 2, not more or less.

      After you generate test cases for each challenge, check the number of test cases that you have generated. If the number is less than 4, automatically add additional test cases with relevant input and output values to ensure there are at least 4 test cases. Please also check that the test cases do not have any empty values. If there are empty values, please remove them and change them to new test cases.

      For the primitive data types, please note the following:
      - For strings, enclose string values within double quotation marks.
      - For integers, simply provide the numeric value without any quotation marks.
      - For float, simply provide the numeric value without any quotation marks using '.' as the decimal separator.
      - For boolean, use the keywords 'true' or 'false' without any quotation marks.
      - For arrays, enclose the array values within square brackets, with each value separated by a comma.
      - For arrays, the values can only be primitive data types (integer, float, boolean, or string). For example: array of integer: [1, 2, 3, 4, 5]; array of strings: ['apple', 'banana', 'cherry', 'durian', 'eggplant']; array of boolean: [true, false, true, false, true]; array of float: [3.14, 2.71, 1.41, 1.61, 1.73].

      A question is characterized by its main focus on basic programming concepts, requiring simple logic to solve. Solutions to easy questions typically involve straightforward approaches, such as checking for prime numbers or reversing a string.      
    `
  
//   `Anda adalah asisten virtual yang bertugas untuk menghasilkan tantangan pemrograman kompetitif. Tugas Anda adalah merespons dengan format JSON yang valid yang berisi judul, nama tugas, dan contoh tantangan. Tantangan-tantangan akan dalam Bahasa Indonesia. Untuk setiap tantangan, Anda harus menyediakan minimal 4 kasus uji positif serta dua kasus uji sederhana bersama dengan solusi langkah demi langkah untuk kasus terkait. Pastikan bahwa data yang digunakan terbatas pada tipe data primitif saja (bilangan bulat, boolean, string, dan/atau array). Harap sediakan contoh kode yang jelas dan fungsional dalam TypeScript, termasuk komentar dan nama variabel yang bermakna. Pastikan untuk menggunakan nama fungsi yang mudah dimengerti.

// Setelah Anda menghasilkan kasus uji untuk setiap tantangan, periksa jumlah kasus uji yang telah Anda hasilkan. Jika jumlahnya kurang dari 4, tambahkan otomatis kasus uji tambahan dengan nilai input dan output yang relevan untuk memastikan ada setidaknya 4 kasus uji. Periksa juga bahwa kasus uji tidak memiliki nilai kosong. Jika ada nilai kosong, hapus dan gantilah dengan kasus uji baru.

// Untuk tipe data primitif, perhatikan hal berikut:
// - Untuk string, masukkan nilai string dalam tanda kutip ganda.
// - Untuk bilangan bulat, cukup berikan nilai numerik tanpa tanda kutip.
// - Untuk float, cukup berikan nilai numerik tanpa tanda kutip dan gunakan "." sebagai pemisah desimal.
// - Untuk boolean, gunakan kata kunci "true" atau "false" tanpa tanda kutip.
// - Untuk array, masukkan nilai-nilai dalam kurung siku, dengan setiap nilai dipisahkan oleh koma.
// - Untuk array, nilai-nilainya hanya boleh tipe data primitif (bilangan bulat, float, boolean, atau string), misalnya: array bilangan bulat: [1, 2, 3, 4, 5] array string: ["apel", "pisang", "ceri", "durian", "terong"] array boolean: [true, false, true, false, true] array float: [3.14, 2.71, 1.41, 1.61, 1.73]

// Untuk memastikan tingkat kesulitan yang sesuai untuk pertanyaan, kategorisasi menjadi mudah, sedang, dan sulit sangat penting, berdasarkan kebutuhan pengguna. Jika preferensi pengguna tidak spesifik, opsi default adalah mengacak tingkat kesulitan di antara ketiga kategori ini.

// Sebuah pertanyaan ditandai dengan fokus utamanya pada konsep pemrograman dasar, yang memerlukan logika sederhana untuk diselesaikan. Solusi untuk pertanyaan mudah biasanya melibatkan pendekatan langsung, seperti memeriksa bilangan prima atau membalikkan string.

// Selain itu, panjang deskripsi pertanyaan dan panjang implementasi fungsi juga memainkan peran penting dalam menentukan tingkat kesulitan. Biasanya, pertanyaan yang lebih sulit memiliki deskripsi yang lebih panjang dan implementasi fungsi yang lebih panjang, yang mengharuskan pemahaman dan analisis logika yang lebih tinggi untuk diselesaikan. Korelasi antara tingkat kesulitan pertanyaan, panjang deskripsi, dan panjang implementasi fungsi dapat membantu dalam mengkategorikan pertanyaan secara akurat.
// `
  
  // Create an array of message objects with roles and content
  const messages = [
    {
          role: "system",
          content: systemPrompt,
    },
        {
          role: "user",
          content:
            "Menghitung total episode anime tokyo revanger",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Total Episode Tokyo Revanger\",\n        \"description\": \"**Nama Soal**: Total Episode Tokyo Revanger.\\n\\n**Aturan**\\n- Buatlah sebuah **function totalEpisode** dengan dua parameter: **season1** (integer) dan **season2** (integer).\\n- Function ini harus **mengembalikan hasil total jumlah episode dari penjumlahan kedua season** (integer).\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **season1 = 10**, **season2 = 5**\\n- Hasil: **15** ( 10 + 5 = 15).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **season1 = 10**, **season2 = 15**\\n- Hasil: **25** ( 10 + 15 = 25).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"season1\",\n                \"typeData\": \"integer\"\n            },{\n                \"name\": \"season2\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"season1\": 10,\n                    \"season2\": 5\n                },\n                \"expectedValue\": 15\n            },\n            {\n                \"inputParameter\": {\n                    \"season1\": 10,\n                    \"season2\": 15\n                },\n                \"expectedValue\": 25\n            },\n            {\n                \"inputParameter\": {\n                    \"season1\": 10,\n                    \"season2\": 20\n                },\n                \"expectedValue\": 30\n            },\n            {\n                \"inputParameter\": {\n                    \"season1\": 10,\n                    \"season2\": 25\n                },\n                \"expectedValue\": 35\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function totalEpisode(season1: number, season2: number): number { return season1 + season2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"totalEpisode\"\n        }\n    }\n]`,
        },
        {
          role: "user",
          content:
            "Sisa Bagi Dua Bilangan",
        },
        {
           role: "assistant",
          content: `[\n    {\n        \"title\": \"Sisa Bagi Dua Bilangan\",\n        \"description\": \"**Nama Soal**: Sisa Bagi Dua Bilangan.\\n\\n**Aturan**\\n- Buatlah sebuah **function sisaBagi** dengan dua parameter: **bilangan1** (integer) dan **bilangan2** (integer).\\n- Function ini harus **mengembalikan hasil sisa bagi** (integer).\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **bilangan1 = 7**, **bilangan2 = 3**\\n- Hasil: **1** (7 MOD 3 = 1).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **bilangan1 = 12**, **bilangan2 = 5**\\n- Hasil: **2** (12 MOD 5 = 2).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"integer\"\n            },\n\t\t\t{\n                \"name\": \"bilangan2\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 7,\n\t\t\t\t  \"bilangan2\": 3\n                },\n                \"expectedValue\": 1\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 12,\n\t\t\t\t  \"bilangan2\": 5\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 10,\n\t\t\t\t  \"bilangan2\": 3\n                },\n                \"expectedValue\": 1\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 10,\n\t\t\t\t  \"bilangan2\": 50\n                },\n                \"expectedValue\": 10\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function sisaBagi(bilangan1: number, bilangan2: number): number { return bilangan1 % bilangan2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"sisaBagi\"\n        }\n    }\n]`,
        },
        {
          role: "user",
          content:
            "Pembagian Dua Bilangan",
        },
        {
           role: "assistant",
          content: `[\n    {\n        \"title\": \"Pembagian Dua Bilangan\",\n        \"description\": \"**Nama Soal**: Pembagian Dua Bilangan.\\n\\n**Aturan**\\n- Buatlah sebuah **function pembagian** dengan dua parameter: **bilangan1** (float) dan **bilangan2** (float).\\n- Function ini harus **mengembalikan hasil pembagian** (float).\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **bilangan1 = 1.0**, **bilangan2 = 1.0**\\n- Hasil: **1.0** (1 / 1 = 1).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **bilangan1 = 4.0**, **bilangan2 = 2.0**\\n- Hasil: **2.0** (4 / 2 = 2).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"float\"\n            },\n            {\n                \"name\": \"bilangan2\",\n                \"typeData\": \"float\"\n            }\n        ],\n        \"expectedTypeData\": \"float\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 1,\n                    \"bilangan2\": 1\n                },\n                \"expectedValue\": 1\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 4,\n                    \"bilangan2\": 2\n                },\n                \"expectedValue\": 4\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 10,\n                    \"bilangan2\": 5\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": 100,\n                    \"bilangan2\": 50\n                },\n                \"expectedValue\": 2\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function pembagian(bilangan1: number, bilangan2: number): number { return bilangan1 / bilangan2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"pembagian\"\n        }\n    }\n]`,
    }, {
          role: "user",
          content:
            "Pembulatan ke Atas Bilangan Real",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Pembulatan ke Atas Bilangan Real\",\n        \"description\": \"**Nama Soal**: Pembulatan ke Atas Bilangan Real.\\n\\n**Aturan**\\n- Buatlah sebuah **function PembulatanKeAtas** dengan satu parameter: **bilanganReal** (float).\\n- Function ini harus **mengembalikan hasil pembulatan ke atas** (integer).\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **bilanganReal = 1.2**\\n- Hasil: **2** (Pembulatan ke atas dari 1.2 adalah 2).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **bilanganReal = 3.7**\\n- Hasil: **4** (Pembulatan ke atas dari 3.7 adalah 4).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilanganReal\",\n                \"typeData\": \"float\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"bilanganReal\": 1.2\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                    \"bilanganReal\": 3.7\n                },\n                \"expectedValue\": 4\n            },\n            {\n                \"inputParameter\": {\n                    \"bilanganReal\": 10.2\n                },\n                \"expectedValue\": 11\n            },\n            {\n                \"inputParameter\": {\n                    \"bilanganReal\": 90.0\n                },\n                \"expectedValue\": 90.0\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function pembulatanKeAtas(bilanganReal: number): number { return Math.ceil(bilanganReal); }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"pembulatanKeAtas\"\n        }\n    }\n]`,
    },
    {
          role: "user",
          content:
            "Perbandingan dua bilangan",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Operator Sama Dengan Dua Bilangan\",\n        \"description\": \"**Nama Soal**: Operator Sama Dengan Dua Bilangan.\\n\\n**Aturan**\\n- Buatlah sebuah **function membandingkanBilangan** dengan dua parameter: **bilangan1** (integer) dan **bilangan2** (integer).\\n- Function ini harus **mengembalikan nilai true/false** (boolean).\\n- Gunakan konsep **IF ELSE** dan operator **sama dengan (==)**.\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **bilangan1 = 5**, **bilangan2 = 5**\\n- Hasil: **true** (Kedua bilangan memiliki nilai yang sama).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **bilangan1 = 3**, **bilangan2 = 7**\\n- Hasil: **false** (Kedua bilangan memiliki nilai yang berbeda).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"integer\"\n            },\n\t\t\t{\n                \"name\": \"bilangan2\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"boolean\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 5,\n\t\t\t\t          \"bilangan2\": 5\n                },\n                \"expectedValue\": true\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 3,\n\t\t\t\t          \"bilangan2\": 7\n                },\n                \"expectedValue\": false\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 0,\n\t\t\t\t          \"bilangan2\": 0\n                },\n                \"expectedValue\": true\n            },\n            {\n                \"inputParameter\": {\n                  \"bilangan1\": 40,\n                  \"bilangan2\": 50\n                },\n                \"expectedValue\": false\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function membandingkanBilangan(bilangan1: number, bilangan2: number): boolean { return bilangan1 == bilangan2; }\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"membandingkanBilangan\"\n        }\n    }\n]`,
        },{
          role: "user",
          content:
            "Penjumlahan beruntun",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Penjumlahan Beruntun suatu Bilangan\",\n        \"description\": \"**Nama Soal**: Penjumlahan Beruntun suatu Bilangan.\\n\\n**Aturan**\\n- Buatlah **function penjumlahanBeruntun** dengan satu parameter: **sebanyak** (integer).\\n- Function harus **mengembalikan hasil penjumlahan beruntun dari 1 hingga sebanyak yang ditentukan** (integer).\\n- Gunakan konsep pengulangan **FOR**.\\n\\n**Contoh Kasus 1**:\\n- Diketahui: **sebanyak = 5**\\n- Hasil: **15** (Karena 1 + 2 + 3 + 4 + 5 = 15).\\n\\n**Contoh Kasus 2**:\\n- Diketahui: **sebanyak = 10**\\n- Hasil: **55** (Karena 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = 55).\",\n        \"difficultyLevel\": 1,\n        \"timeEstimationToFinish\": \"5 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"sebanyak\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"sebanyak\": 5\n                },\n                \"expectedValue\": 15\n            },\n            {\n                \"inputParameter\": {\n                    \"sebanyak\": 10\n                },\n                \"expectedValue\": 55\n            },\n            {\n                \"inputParameter\": {\n                    \"sebanyak\": 3\n                },\n                \"expectedValue\": 6\n            },\n            {\n                \"inputParameter\": {\n                    \"sebanyak\": 2\n                },\n                \"expectedValue\": 3\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function penjumlahanBeruntun(bilangan: number): number {\\n  let total = 0;\\n  for (let i = bilangan; i >= 1; i--) {\\n    total += i;\\n  }\\n  return total;\\n}\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"penjumlahanBeruntun\"\n        }\n    }\n]`,
        },
        {
          role: "user",
          content: prompt,
        },
  ];

  return messages;
}
