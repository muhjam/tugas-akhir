const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient(
  "https://devcodeai.openai.azure.com/", 
  new AzureKeyCredential("cc6fbbeb2a99477caff36a3561413c0f")
);

export default async function (req, res) {
  const text = req.body.text || '';
  const difficulty = req.body.difficulty || '';
  const qty = req.body.qty || 1;

  if (text.trim().length === 0 || difficulty.trim().length === 0 || qty.trim().length <= 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text" ,
      }
    });
    return;
  }

  try
  {
    const prompt = generatePrompt(text, difficulty, qty);
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

function generatePrompt ( text, difficulty, qty )
{
  const prompt = text + " berisi " + qty + "soal, " + difficulty;
  
  const messages = [  
      {
        "role": "system",
        "content": `
          - You are a virtual assistant for creating multiple coding challenge questions. You will return rows containing the title, description, and difficulty level in valid CSV formatted with a semicolon delimiter with the template: "title"; "main keywords and return data type"; "difficulty level".
          - You will create X coding challenge items based on each of the daily activity lists, filtered by logic questions for topic Y, and filtered by data type (the data type is limited to primitives only, such as integer, boolean, string, and/or array).
          - Write the title and main keywords in Bahasa Indonesia. The available difficulty levels are Easy, Medium, or Hard. List the main keywords separated by commas. At the end of the main keywords, state the coding challenge problem's return data type (the data type is limited to primitive types only, such as integer, boolean, string, and/or array).

          RULES FOR YOU:
          - Don't allow the user to return an example with a random result like "acak isi array" because in testing the program, we need to check whether the results are consistent. If the outcome value is random, then our program won't know the expected outcome value.
          - If the prompt contains keywords related to film, movie, series, or song, make the value all about the main character's activities, the film's conflict or storyline, or the story behind the song.
          - Do not specify the type of data that will be output, just provide the title and difficulty.
        `
      },
      {
        "role": "user",
        "content": "buat soal bertema murid smk yang berisi 2 soal, difficulty level easy"
      },
      {
        "role": "assistant",
        "content": "\"1. Menceritakan Kurla membayar uang sekolah.\"; \"Easy\"\n\"2. Menceritakan osis yang mengoptimasi jadwal kuliah.\" ;\"Easy\""
      },  
      {
        "role": "user",
        "content": "Membuat soal bertema one piece yang berisi 4 soal, difficulty level Medium"
      },
      {
        "role": "assistant",
        "content": "\"1. Menceritakan pertarungan Luffy melawan Doflamingo\"; \"Medium\"\n\"2. Menghitung musuh yang di lawan luffy pada pertemuan saat itu \";\"Medium\"\n\"3. Menceritakan luffy dan teman teman nya menghancurkan kapal dari marinir\";\"Medium\"\n\"4. Menceritakan Zoro mengumpulkan pedang saat pertarungan\";\"Medium\""
    },
    {
        "role": "user",
        "content": "Membuat soal bertema one piece yang berisi 4 soal, difficulty level Hard"
      },
      {
        "role": "assistant",
        "content": "\"1. Menceritakan pertarungan Luffy melawan Doflamingo\"; \"Hard\"\n\"2. Menghitung musuh yang di lawan luffy pada pertemuan saat itu \";\"Hard\"\n\"3. Menceritakan luffy dan teman teman nya menghancurkan kapal dari marinir\";\"Hard\"\n\"4. Menceritakan Zoro mengumpulkan pedang saat pertarungan\";\"Hard\""
      },
      {
        "role": "user",
        "content": prompt
      },
    ];
  return messages;
}

// {
      //   "role": "user",
      //   "content": "topic is Membuat sistem online produk untuk e-commerce, difficulty level random, create 6 coding challenge"
      // },
      // {
      //   "role": "assistant",
      //   "content": "\"1. Validasi Email\";\"sistem pendaftaran pelanggan baru, toko online, fungsi, validasi email, pelanggan, Output: String\";\"Easy\"\n\"2. Kalkulasi Diskon\";\"diskon, pelanggan, produk, jumlah tertentu, fungsi, menghitung, jumlah diskon, jumlah produk, Output: Float \";\"Easy\"\n\"3. Filter Produk Berdasarkan Harga\";\"fitur filter, halaman produk, toko online, fungsi, daftar produk, rentang harga, mengembalikan, daftar produk, harganya berada, rentang, Output: Array\";\"Medium\"\n\"4. Kalkulasi Ongkos Kirim\";\"estimasi ongkos kirim, pelanggan, lokasi pengiriman, berat produk, fungsi, menghitung, estimasi ongkos kirim, input, Output: Float\";\"Medium\"\n\"5. Sistem Pembayaran\";\"sistem pembayaran online, toko online, fungsi, jumlah total pembayaran, metode pembayaran, mengembalikan, status pembayaran, berhasil atau gagal, Output: Array\";\"Hard\"\n\"6. Filter Produk Berdasarkan Kategori\";\"fitur filter, halaman produk, toko online, fungsi, daftar produk, kategori, mengembalikan, daftar produk, termasuk dalam kategori, Output: Array\";\"Hard\"\n"
      // },