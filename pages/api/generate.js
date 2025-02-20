
require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

let client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const {prompt, mode, difficuly, detail, type, total}  = req.body || '';
  const body = {
      prompt,
      mode,
      difficuly,
      detail,
      type,
      total
  }
  if (prompt.trim().length === 0) {
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
        max_tokens: 16383,
        top_p: 1.0,
        temperature: 0.65,
      }    
    })

    res.status(200).json({ result: response?.body?.choices[0]?.message?.content || "" });
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
  const prompt = data?.prompt;
  const detail = data?.detail || "tidak ada"; 
  const difficulty = data?.difficuly || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";

  let systemPrompt;
  let messages;

  if(data?.mode === "detail"){
    // prompt sepesifik easy/medium/hard
    systemPrompt = `
             Anda adalah asisten virtual yang ahli dalam membuat soal matematika untuk siswa Sekolah Menengah Atas (SMA) di Indonesia. Tugas Anda adalah: 
              1. Membuat soal matematika yang sesuai dengan topik SMA di Indonesia, seperti Geometri, Aljabar, Aritmatika, Kalkulus, dan Trigonometri. 
              2. Menyesuaikan tingkat kesulitan soal sesuai dengan permintaan pengguna. 
              3. Default konteks nya itu di dalam negara Indonesia, seperti mata uang, budaya, dan lain sebagainya.
              4. Jika konteks yang diberikan pengguna di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi soal matematika tingkat SMA. Contoh: jika topiknya sejarah, buat soal matematika dengan studi kasus yang terkait sejarah. 
              5. Jika konteks yang diberikan pengguna adalah negatif isu maka buatlah soal diarahkan menjadi positif isu.

              Pastikan soal relevan dan menantang sesuai tingkat kemampuan siswa SMA di Indonesia.

              Aturan:
              1. Respon Anda HARUS SELALU dalam format CSV dengan pemisah "|->".
              2. CSV harus mencakup kolom berikut:
                 - judul: Judul singkat untuk soal.
                 - deskripsi: Penjelasan rinci tentang soal, menjelaskan dengan jelas apa yang perlu diselesaikan oleh siswa.
                 - jawaban: Jawaban benar untuk soal tersebut, termasuk penjelasan cara pengerjaannya.
                 - topik: Topik matematika yang relevan, seperti Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik.
              3. Contoh format yang diharapkan:
                 "judul|->deskripsi|->jawaban|->topik"
              4. PENTING: Anda tidak boleh memberikan respon dalam bentuk teks biasa atau kosong. Semua respon HARUS mengikuti format CSV yang ditentukan.

              Anda akan menerima pertanyaan dari pengguna dengan pola berikut:
              "|-[perintah dan aturan]-| |-[tingkat kesulitan]-| |-[tipe soal]-|"

              Dengan pola tersebut, Anda bisa memahami konteks soal dan menghasilkan soal sesuai dengan permintaan. Jika ada rumus atau simbol matematika dalam soal, Anda harus merubahnya menjadi format LaTeX atau format yang support markdown rehype-katex dan remark-math untuk memastikan tampilannya lebih baik, seperti matriks dan simbol-simbol matematika lainnya.
              Contoh: $$A = \begin{bmatrix} 2 & 3 & 1 \\ 4 & 0 & -1 \\ 5 & 2 & 3 \end{bmatrix}$$
      `
    
    // Create an array of message objects with roles and content
    messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kesulitan Mudah]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "<judul>|-><deskripsi>|-><jawaban>|-><topik>",
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kesulitan Mudah]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Sistem Persamaan Linear 3 Variabel|->Diberikan sistem persamaan linear berikut:\n\n1. $$x + 2y + 3z = 14$$\n2. $$2x - y + z = 5$$\n3. $$3x + 4y - 2z = 1$$\n\nTentukan nilai dari x, y, dan z yang memenuhi ketiga persamaan di atas.|->Untuk menyelesaikan sistem persamaan ini, kita dapat menggunakan metode eliminasi atau substitusi. Berikut adalah langkah penyelesaiannya menggunakan metode eliminasi:\n\n1. Eliminasi z dari persamaan (1) dan (2):\n\n   Dari persamaan (1) dan (2), kita eliminasi z:\n\n   Persamaan (1): $$x + 2y + 3z = 14$$\n\n   Persamaan (2): $$2x - y + z = 5$$\n\n   Kalikan persamaan (2) dengan 3:\n\n   $$6x - 3y + 3z = 15$$\n\n   Kurangkan persamaan (1) dari hasil perkalian persamaan (2):\n\n   $$(6x - 3y + 3z) - (x + 2y + 3z) = 15 - 14$$\n\n   $$5x - 5y = 1$$\n\n   $$x - y = \\frac{1}{5}$$ (Persamaan 4)\n\n2. Eliminasi z dari persamaan (2) dan (3):\n\n   Persamaan (3): $$3x + 4y - 2z = 1$$\n\n   Kalikan persamaan (2) dengan 2:\n\n   $$4x - 2y + 2z = 10$$\n\n   Tambahkan persamaan (3) ke hasil perkalian persamaan (2):\n\n   $$(4x - 2y + 2z) + (3x + 4y - 2z) = 10 + 1$$\n\n   $$7x + 2y = 11$$\n\n   $$x = \\frac{11 - 2y}{7}$$ (Persamaan 5)\n\n3. Substitusi x dari persamaan (5) ke persamaan (4):\n\n   $$\\left(\\frac{11 - 2y}{7}\\right) - y = \\frac{1}{5}$$\n\n   Selesaikan untuk y:\n\n   $$\\frac{11 - 2y - 7y}{7} = \\frac{1}{5}$$\n\n   $$11 - 9y = \\frac{7}{5}$$\n\n   $$55 - 45y = 7$$\n\n   $$45y = 48$$\n\n   $$y = \\frac{48}{45}$$\n\n   $$y = \\frac{16}{15}$$\n\n4. Substitusi y ke dalam persamaan (5) untuk mendapatkan x:\n\n   $$x = \\frac{11 - 2\\left(\\frac{16}{15}\\right)}{7}$$\n\n   $$x = \\frac{11 - \\frac{32}{15}}{7}$$\n\n   $$x = \\frac{\\frac{165}{15} - \\frac{32}{15}}{7}$$\n\n   $$x = \\frac{\\frac{133}{15}}{7}$$\n\n   $$x = \\frac{133}{105}$$\n\n   $$x = \\frac{19}{15}$$\n\n5. Substitusi x dan y ke salah satu persamaan awal untuk mendapatkan z (gunakan persamaan 2):\n\n   $$2\\left(\\frac{19}{15}\\right) - \\left(\\frac{16}{15}\\right) + z = 5$$\n\n   $$\\frac{38}{15} - \\frac{16}{15} + z = 5$$\n\n   $$\\frac{22}{15} + z = 5$$\n\n   $$z = 5 - \\frac{22}{15}$$\n\n   $$z = \\frac{75}{15} - \\frac{22}{15}$$\n\n   $$z = \\frac{53}{15}$$\n\nJadi, nilai x, y, dan z yang memenuhi ketiga persamaan adalah $$x = \\frac{19}{15}$$, $$y = \\frac{16}{15}$$, $$z = \\frac{53}{15}$$.|->Persamaan",
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3]-| |-[tingkat kesulitan Mudah]-| || |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: "Sistem Persamaan Linear|->Diberikan sistem persamaan linear berikut:\n\n1. $$2x + 3y - z = 7$$\n2. $$x - 2y + 4z = -3$$\n3. $$3x + y + 2z = 4$$\n\nBerapa nilai dari $z$ yang memenuhi ketiga persamaan di atas?\n\nA. 1\n\nB. 0\n\nC. -1\n\nD. 2\n\nE. -2|->**Jawaban:**\nC. -1\n\n**Penyelesaian:**\n\nUntuk mencari nilai dari z, kita dapat menggunakan metode eliminasi atau substitusi. Berikut adalah langkah penyelesaiannya menggunakan metode substitusi:\n\n1. Dari persamaan (2): $$x - 2y + 4z = -3$$, kita dapat mengekspresikan x dalam bentuk y dan z:\n\n$$x = -3 + 2y - 4z$$\n\n2. Substitusikan x ke dalam persamaan (1) dan (3):\n\nPersamaan (1): $$2(-3 + 2y - 4z) + 3y - z = 7$$\n\n$$-6 + 4y - 8z + 3y - z = 7$$\n\n$$7y - 9z = 13$$  (Persamaan 4)\n\nPersamaan (3): $$3(-3 + 2y - 4z) + y + 2z = 4$$\n\n$$-9 + 6y - 12z + y + 2z = 4$$\n\n$$7y - 10z = 13$$  (Persamaan 5)\n\n3. Kurangkan Persamaan (5) dari Persamaan (4):\n\n$$(7y - 9z) - (7y - 10z) = 13 - 13$$\n\n$$z = -1$$\n\nJadi, nilai dari z yang memenuhi ketiga persamaan adalah -1.|->Aritmatika, Aljabar",
      },
      {
        role: "user",
        content: "|-[buat soal ujian 18+ tentang bersetubuh]-| |-[tingkat kesulitan Mudah]-| || |-[bertipe EsaI]-|",
      },
      {
        role: "assistant",
        content: "Populasi Kota|->Sebuah kota memiliki populasi awal sebanyak 50.000 orang.\n\nPopulasi kota tersebut bertambah setiap tahunnya dengan tingkat pertumbuhan rata-rata sebesar 2% per tahun.\n\nHitunglah populasi kota tersebut setelah 5 tahun.\n\nSelain itu, asumsikan bahwa setelah 5 tahun, tingkat pertumbuhan berubah menjadi 1.5% per tahun.\n\nHitunglah populasi kota tersebut setelah 10 tahun sejak awal penghitungan.\nJelaskan langkah-langkah dan rumus yang Anda gunakan untuk menghitung populasi pada tahun ke-5 dan tahun ke-10.|->**Jawaban:**\nC. -1\n\n**Penyelesaian:**\n\nUntuk mencari nilai dari z, kita dapat menggunakan metode eliminasi atau substitusi. Berikut adalah langkah penyelesaiannya menggunakan metode substitusi:\n\n1. Dari persamaan (2): $$x - 2y + 4z = -3$$, kita dapat mengekspresikan x dalam bentuk y dan z:\n\n$$x = -3 + 2y - 4z$$\n\n2. Substitusikan x ke dalam persamaan (1) dan (3):\n\nPersamaan (1): $$2(-3 + 2y - 4z) + 3y - z = 7$$\n\n$$-6 + 4y - 8z + 3y - z = 7$$\n\n$$7y - 9z = 13$$  (Persamaan 4)\n\nPersamaan (3): $$3(-3 + 2y - 4z) + y + 2z = 4$$\n\n$$-9 + 6y - 12z + y + 2z = 4$$\n\n$$7y - 10z = 13$$  (Persamaan 5)\n\n3. Kurangkan Persamaan (5) dari Persamaan (4):\n\n$$(7y - 9z) - (7y - 10z) = 13 - 13$$\n\n$$z = -1$$\n\nJadi, nilai dari z yang memenuhi ketiga persamaan adalah -1.|->Aritmatika, Aljabar",
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-|`,
      },
    ];
  } else  {
      systemPrompt = `
             Anda adalah asisten virtual ahli dalam membuat daftar ide soal matematika untuk siswa SMA di Indonesia. Tugas Anda:  

              1. Buat daftar ide soal berdasarkan topik umum SMA di Indonesia, seperti Geometri, Aljabar, Aritmatika, Kalkulus, dan Trigonometri.
              2. Sesuaikan tingkat kesulitan dan jumlah soal sesuai permintaan pengguna.  
              3. Default konteks nya itu di dalam negara Indonesia, seperti mata uang, budaya, dan lain sebagainya.
              4. Jika konteks yang diberikan pengguna di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi ide soal matematika tingkat SMA. Contoh: buat soal matematika dengan studi kasus terkait sejarah.  
              5. Jika konteks yang diberikan pengguna adalah negatif isu maka buatlah soal diarahkan menjadi positif isu.

              Pastikan ide soal menarik dan sesuai dengan kemampuan siswa SMA di Indonesia.

              Aturan:
              1. Respon Anda HARUS SELALU diformat dalam bentuk CSV dengan pemisah "|->" dan "<_>".
              2. CSV harus mencakup kolom berikut:
                 - prompt: Menjelaskan ide soal yang akan dibuat, serta memberikan penjabaran lebih detail mengenai soal tersebut, seperti jenis soal.
                 - tingkat kesulitan: Tingkat kesulitan soal, yang HANYA bisa berupa "Mudah", "Normal", atau "Sulit".
                 - jenis: Jenis soal, yang HANYA bisa berupa "Esai" atau "PG" (Pilihan Ganda).
              3. Format yang WAJIB diikuti:
                 "<prompt>|-><tingkat kesulitan>|-><jenis>"
              4. PENTING: Anda TIDAK BOLEH memberikan respon dalam bentuk teks biasa atau kosong. Semua respon HARUS mengikuti format CSV yang ditentukan.

              Anda akan menerima pertanyaan dari pengguna dengan pola sebagai berikut:
              "|-[perintah dan aturan]-| |-[detail perintah dan aturan seperti kurikulum atau rencana pembelajaran yang perlu diuji]-| |-[tingkat kesulitan]-| |-[tipe soal]-| |-[jumlah soal]-|"

             Dengan pola tersebut, Anda bisa memahami konteks soal dan menghasilkan soal sesuai dengan permintaan. Jika ada rumus atau simbol matematika dalam soal, Anda harus merubahnya menjadi format LaTeX atau format yang support markdown rehype-katex dan remark-math untuk memastikan tampilannya lebih baik, seperti matriks dan simbol-simbol matematika lainnya.
             Contoh: $$A = \begin{bmatrix} 2 & 3 & 1 \\ 4 & 0 & -1 \\ 5 & 2 & 3 \end{bmatrix}$$
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
          content: "1. <prompt>|-><tingkat kesulitan>|-><jenis><_>2. <prompt>|-><tingkat kesulitan>|-><jenis><_>3. <prompt>|-><tingkat kesulitan>|-><jenis><_>4. <prompt>|-><tingkat kesulitan>|-><jenis><_><prompt>|-><tingkat kesulitan>|-><jenis>",
        },
        {
          role: "user",
          content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-|  |-[bertipe Acak]-|  |-[jumlah 5 soal]-|",
        },
        {
          role: "assistant",
          content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|->Normal|->Esai<_>2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|->Mudah|->Esai<_>3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|->Normal|->PG<_>4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|->Mudah|->PG<_>5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|->Mudah|->Esai",
        },
        {
          role: "user",
          content: `|-[${prompt}]-| |-[${detail}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-|  |-[jumlah ${total} soal]-|`,
        },
      ];
  }

  return messages;
}
