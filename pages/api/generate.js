
require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

let client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const {text, mode, difficuly, detail, type, total}  = req.body || '';
  const body = {
      text,
      mode,
      difficuly,
      detail,
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
  const detail = data?.detail || "tidak ada"; 
  const difficulty = data?.difficuly || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";

  let systemPrompt;
  let messages;

  if(data?.mode === "detail"){
    // prompt sepesifik easy/medium/hard
    systemPrompt = `
              Anda adalah asisten virtual yang spesialis dalam membuat soal matematika untuk tingkat Sekolah Menengah Atas (SMA). Tugas Anda adalah membuat soal matematika yang relevan dengan topik umum SMA seperti Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik. Soal yang Anda buat harus disesuaikan dengan tingkat kesulitan yang diminta oleh pengguna.

              Respon Anda harus diformat dalam bentuk CSV dengan pemisah "|" dan mencakup kolom-kolom berikut:

              - **judul**: Judul singkat untuk soal.
              - **deskripsi**: Deskripsi rinci tentang soal, menjelaskan dengan jelas apa yang perlu diselesaikan oleh siswa.
              - **jawaban**: Jawaban yang benar untuk soal tersebut.
              - **topik**: Topik matematika yang relevan, seperti Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik.

              Contoh format soal dalam CSV:
              "judul|deskripsi|jawaban|topik"

              Anda akan menerima pertanyaan dari pengguna dengan pola berikut:
              "|-[perintah dan aturan]-| |-[tingkat kesulitan]-| |-[tipe soal]-|"

              Dengan pola tersebut, Anda bisa memahami konteks soal dan menghasilkan soal sesuai dengan permintaan. Jika ada rumus atau simbol matematika dalam soal, Anda harus merubahnya menjadi format LaTeX untuk memastikan tampilannya lebih baik, seperti matriks dan simbol-simbol matematika lainnya.
              Contoh: $$A = \\begin{bmatrix} 2 & 3 & 1 \\\ 4 & 0 & -1 \\\ 5 & 2 & 3 \\end{bmatrix}$$
      `
    
    // Create an array of message objects with roles and content
    messages = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: "|-[buat soal aritmatika]-| |-[tingkat kesulitan Mudah]-| |-[bertipe Esai]-|",
          },
          {
            role: "assistant",
            content: "Perhitungan Aritmatika|Seorang siswa membeli beberapa pensil dengan harga yang sama. Jika siswa tersebut membayar total $36 dan mendapatkan 9 pensil, berapa harga satu pensil?|Harga satu pensil adalah Rp 60.000|Algebra",
          },
          {
            role: "user",
            content: "|-[buat soal aritmatika]-| |-[tingkat kesulitan Mudah]-| || |-[bertipe PG]-|",
          },
          {
            role: "assistant",
            content: "Perhitungan Aritmatika|Seorang siswa membeli beberapa pensil dengan harga yang sama. Jika siswa tersebut membayar total $36 dan mendapatkan 9 pensil, berapa harga satu pensil?\n\nA. Rp30.000\n\nB. Rp60.000\n\nC. Rp150.000\n\nD. Rp200.000\n\nE. Rp300.000|B. Rp60.000|Algebra",
          },
          {
            role: "user",
            content: "|-[matriks 3x3]-| |-[tingkat kesulitan Mudah]-| || |-[bertipe Esai]-|",
          },
          {
            role: "assistant",
            content: "Determinan Matriks 3x3|Diberikan matriks $$ A = \\begin{bmatrix} 2 & 1 & 3 \\\ 0 & -1 & 4 \\\ 5 & 2 & 0 \\end{bmatrix}$$. Hitunglah determinan dari matriks ( A ).|Algebra",
          },
          {
            role: "user",
            content: `|-[${prompt}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-|`,
          },
    ];
  } else  {
      systemPrompt = `
              Anda adalah asisten virtual yang berspesialisasi dalam membuat daftar ide prompt untuk soal matematika tingkat Sekolah Menengah Atas (SMA). Daftar ide soal yang Anda buat harus didasarkan pada topik-topik umum SMA seperti Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik, dengan tingkat kesulitan dan jumlah soal yang disesuaikan dengan permintaan pengguna.

              Respon Anda harus diformat dalam bentuk CSV dengan pemisah "|" dan "\n", mencakup kolom-kolom berikut:

              - **prompt**: Menjelaskan ide soal yang akan dibuat, serta memberikan penjabaran lebih detail mengenai soal tersebut, seperti jenis soal dan apa yang perlu diselesaikan oleh siswa.
              - **tingkat kesulitan**: Tingkat kesulitan soal, yang hanya bisa berupa "Mudah", "Normal", atau "Sulit".
              - **jenis**: Jenis soal, yang hanya bisa berupa "Esai" atau "PG" (Pilihan Ganda).

              Format yang harus Anda ikuti adalah:
              "<prompt>|<tingkat kesulitan>|<jenis>"

              Anda akan menerima pertanyaan dari pengguna dengan pola sebagai berikut:
              "|-[perintah dan aturan]-| |-[detail perintah dan aturan seperti kurikulum atau rencana pembelajaran yang perlu diuji]-| |-[tingkat kesulitan]-| |-[tipe soal]-| |-[jumlah soal]-|"

              Dengan pola ini, Anda bisa memahami konteks soal yang diminta dan menghasilkan daftar ide soal sesuai dengan permintaan pengguna. Jika ada rumus atau simbol matematika dalam ide soal, Anda harus merubahnya menjadi format LaTeX untuk memastikan tampilan yang lebih baik, seperti matriks dan simbol matematika lainnya.
              Contoh: $$A = \\begin{bmatrix} 2 & 3 & 1 \\\ 4 & 0 & -1 \\\ 5 & 2 & 3 \\end{bmatrix}$$
      `

      // Create an array of message objects with roles and content
      messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-|  |-[bertipe Acak]-|  |-[jumlah 5 soal]-|",
        },
        {
          role: "assistant",
          content: "1. <prompt>|<tingkat kesulitan>|<jenis>\n2. <prompt>|<tingkat kesulitan>|<jenis>\n3. <prompt>|<tingkat kesulitan>|<jenis>\n4. <prompt>|<tingkat kesulitan>|<jenis>\n<prompt>|<tingkat kesulitan>|<jenis>",
        },
        {
          role: "user",
          content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-|  |-[bertipe Acak]-|  |-[jumlah 5 soal]-|",
        },
        {
          role: "assistant",
          content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|Normal|Esai\n2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|Mudah|Esai\n3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|Normal|PG\n4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|Mudah|PG\n5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|Mudah|Esai",
        },
        {
          role: "user",
          content: `|-[${prompt}]-| |-[${detail}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-|  |-[jumlah ${total} soal]-|`,
        },
      ];
  }

  return messages;
}
