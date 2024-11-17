require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

let client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const {text, mode, difficuly, type, total}  = req.body || '';
  const body = {
      text,
      mode,
      difficuly,
      type,
      total
  }
  if (text.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text",
      }
    });
    return;
  }
  
  try {
    const messages = generatePrompt(body);
    const response = await await client.path(path).post({
      body: {
        messages,
        // max_tokens: 4096,
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

function generatePrompt ( data )
{
  const prompt = data?.text;
  const difficulty = data?.difficuly || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";

  let systemPrompt;
  let messages;

  if(data?.mode === "detail"){
    // prompt sepesifik easy/medium/hard
    systemPrompt = `
     Anda adalah asisten virtual yang berspesialisasi dalam membuat soal matematika untuk tingkat sekolah menengah atas. Tolong buatkan sebuah soal matematika untuk siswa SMA. Soal tersebut harus berdasarkan topik umum SMA seperti aljabar, geometri, trigonometri, kalkulus, atau statistik dan juga tingkat kesulitan yang disesuaikan dengan keinginan pengguna. Respon harus diformat dalam bentuk CSV dengan pemisah "|" dan mencakup:

      - judul: Judul singkat untuk soal.
      - deskripsi: Deskripsi rinci tentang soal, menjelaskan dengan jelas apa yang perlu diselesaikan oleh siswa.
      - jawaban: Jawaban yang benar untuk soal tersebut.
      - topik: Topik matematika yang relevan (contoh: Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik).
      `
    
    // Create an array of message objects with roles and content
    messages = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: "buat soal aritmatika dengan tingkat kesulitan Mudah dan bertipe Esai",
          },
          {
            role: "assistant",
            content: "Perhitungan Aritmatika|Seorang siswa membeli beberapa pensil dengan harga yang sama. Jika siswa tersebut membayar total $36 dan mendapatkan 9 pensil, berapa harga satu pensil?|Harga satu pensil adalah Rp 60.000|Algebra",
          },
          {
            role: "user",
            content: "buat soal aritmatika dengan tingkat kesulitan Mudah dan bertipe PG",
          },
          {
            role: "assistant",
            content: "Perhitungan Aritmatika|Seorang siswa membeli beberapa pensil dengan harga yang sama. Jika siswa tersebut membayar total $36 dan mendapatkan 9 pensil, berapa harga satu pensil?\n\nA. Rp30.000\n\nB. Rp60.000\n\nC. Rp150.000\n\nD. Rp200.000\n\nE. Rp300.000|B. Rp60.000|Algebra",
          },
          {
            role: "user",
            content: `${prompt} dengan tingkat kesulitan ${difficulty} dan bertipe ${type}`,
          },
    ];
  } else  {
      systemPrompt = `
        Anda adalah asisten virtual yang berspesialisasi dalam membuat daftar ide prompt untuk soal matematika tingkat sekolah menengah atas. Daftar soal harus berdasarkan topik umum SMA seperti aljabar, geometri, trigonometri, kalkulus, atau statistik dan juga tingkat kesulitan serta jumlah soal yang disesuaikan dengan keinginan pengguna. Respon harus diformat dalam bentuk CSV dengan pemisah "|" serta "\n" dan mencakup:

        - prompt: Menjelaskan ide soal yang akan dibuatnya seperti apa.
        - tingkat kesulitan: Hanya "Mudah", "Normal", atau "Sulit".
        - jenis: Hanya "Esai" atau "PG".
      `

      // Create an array of message objects with roles and content
      messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "buat list soal matematika dasar dengan tingkat kesulitan Acak dan bertipe Acak dengan jumlah 5 soal",
        },
        {
          role: "assistant",
          content: "1. <prompt>|<tingkat kesulitan>|<jenis>\n2. <prompt>|<tingkat kesulitan>|<jenis>\n3. <prompt>|<tingkat kesulitan>|<jenis>\n4. <prompt>|<tingkat kesulitan>|<jenis>\n<prompt>|<tingkat kesulitan>|<jenis>",
        },
        {
          role: "user",
          content: "buat list soal matematika dasar dengan tingkat kesulitan Acak dan bertipe Acak dengan jumlah 5 soal",
        },
        {
          role: "assistant",
          content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|Normal|Esai\n2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|Mudah|Esai\n3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|Normal|PG\n4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|Mudah|PG\n5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|Mudah|Esai",
        },
        {
          role: "user",
          content: `${prompt} dengan tingkat kesulitan ${difficulty} dan bertipe ${type} dengan jumlah ${total} soal`,
        },
      ];
  }

  return messages;
}
