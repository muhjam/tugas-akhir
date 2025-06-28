
require('dotenv').config();
const { AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

const client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const { prompt, mode, difficulty, reference, type, total } = req.body || {};

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({
      error: { message: "Please enter a valid text" }
    });
  }

  try {
    if(mode === "detail"){
      const body = {
        prompt,
        mode,
        difficulty,
        reference,
        type,
        total
      }
      const messages = generatePrompt(body);
      const response = await await client.path(path).post({
        body: {
          messages,
          max_tokens: 16384,
          top_p: 1.0,
          temperature: 0.65,
        }    
      })
  
      res.status(200).json({ result: response?.body?.choices[0]?.message?.content || "" });
      return;
    }

    const chunkSize = 5;
    const totalQuestions = parseInt(total, 10);
    const responses = [];

    let startIndex = 1;
    while (startIndex <= totalQuestions) {
      const endIndex = Math.min(startIndex + chunkSize - 1, totalQuestions);
      const currentChunkSize = endIndex - startIndex + 1;

      // Prepare request body for this chunk, include range info
      const chunkBody = {
        prompt,
        mode,
        difficulty,
        reference,
        type,
        total: currentChunkSize,
        range: { start: startIndex, end: endIndex }
      };

      const messages = generatePrompt(chunkBody);
      const apiResponse = await client.path(path).post({
        body: {
          messages,
          max_tokens: 16384,
          top_p: 1.0,
          temperature: 0.65,
        }
      });

      const content = apiResponse?.body?.choices[0]?.message?.content || "";
      responses.push(content);

      startIndex = endIndex + 1;
    }

    // Combine all chunked responses into one
    const combinedResult = responses.join("\n");
    res.status(200).json({ result: combinedResult });

  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: { message: 'An error occurred during your request.' }
    });
  }
}

function generatePrompt ( data )
{
  const prompt = data?.prompt;
  const reference = data?.reference || "tidak ada"; 
  const difficulty = data?.difficuly || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";
  const range = data?.range || { start: 1, end: total };
  const mode = data?.mode || "list";

  const latexExample = `
    "$$A = \\begin{bmatrix} 2 & 3 & 1 \\\\ 4 & 0 & -1 \\\\ 5 & 2 & 3 \\end{bmatrix}$$"
    "$$\\frac{1}{2} + \\frac{1}{4} - \\frac{1}{8}$$."
    "f(x) = $\\frac{x^2 - 1}{x - 1}$ saat  (x)"
    "$$d = \\sqrt{25}$$"
    "$[\\begin{array}{c}10,7 \\\\\\end{array}]$"
    "$$\n
      \\begin{array}{r}
          345 \\\\
      +  678 \\\\
      \\hline
          ??? \\\\
      \\end{array}\n
      $$"
    "$$\\text{Volume} = \\text{panjang} \\times \\text{lebar} \\times \\text{tinggi}$$"
    "$$\n
    A = \\begin{bmatrix} 
    a_{11} & a_{12} & a_{13} \\\\
    a_{21} & a_{22} & a_{23} \\\\
    \\end{bmatrix}\n
    $$"
    "$(A \\times B)$"
    "$(log_2{8} = x)$"
    "$[2^x = 8]$"
  `

  const svgExample =`
    kubus:{<svg width="250" height="250" viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg"><polygon points="70,70 170,70 170,170 70,170" fill="none" stroke="black" stroke-width="2"/><polygon points="70,70 40,40 40,140 70,170" fill="none" stroke="black" stroke-width="2"/><polygon points="70,70 170,70 140,40 40,40" fill="none" stroke="black" stroke-width="2"/><line x1="170" y1="70" x2="140" y2="40" stroke="black" stroke-width="2"/><line x1="170" y1="170" x2="140" y2="140" stroke="black" stroke-width="2"/><line x1="140" y1="40" x2="140" y2="140" stroke="black" stroke-width="2"/><line x1="70" y1="170" x2="40" y2="140" stroke="black" stroke-width="2"/><line x1="40" y1="140" x2="140" y2="140" stroke="black" stroke-width="2"/></svg>}
    balok:{<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" stroke-width="2"><polygon points="60,80 200,80 200,180 60,180" /><polygon points="60,80 100,40 240,40 200,80" /><polygon points="200,80 240,40 240,140 200,180" /><line x1="60" y1="180" x2="100" y2="140" /><line x1="100" y1="40" x2="100" y2="140" /><line x1="100" y1="140" x2="240" y2="140" /></svg>}
    tabung:{<svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="50" rx="60" ry="20" fill="none" stroke="black" stroke-width="2"/><line x1="40" y1="50" x2="40" y2="250" stroke="black" stroke-width="2"/><line x1="160" y1="50" x2="160" y2="250" stroke="black" stroke-width="2"/><path d="M40 250 A60 20 0 0 1 160 250" fill="none" stroke="black" stroke-width="2" stroke-dasharray="5,5"/><path d="M160 250 A60 20 0 0 1 40 250" fill="none" stroke="black" stroke-width="2"/></svg>}
    kerucut:{<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg"><line x1="100" y1="20" x2="30" y2="200" stroke="black" stroke-width="2"/><line x1="100" y1="20" x2="170" y2="200" stroke="black" stroke-width="2"/><path d="M30 200 Q100 230 170 200" stroke="black" fill="none" stroke-width="2"/><path d="M170 200 Q100 170 30 200" stroke="black" fill="none" stroke-dasharray="6,4" stroke-width="2"/></svg>}
    lisma segi empat:{<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><polygon points="80,200 200,200 180,240 60,240" fill="none" stroke="black" stroke-width="2" /><line x1="140" y1="80" x2="80" y2="200" stroke="black" stroke-width="2" /><line x1="140" y1="80" x2="200" y2="200" stroke="black" stroke-width="2" /><line x1="140" y1="80" x2="180" y2="240" stroke="black" stroke-width="2" /><line x1="140" y1="80" x2="60" y2="240" stroke="black" stroke-width="2" stroke-dasharray="6,4" /></svg>}
  `

  let systemPrompt;
  let messages;

  if(mode === "detail"){
      systemPrompt = `
      ---
      Goal:
      Saya ingin sebuah sistem yang dapat membuat soal matematika tingkat Sekolah Menengah Atas (SMA) menggunakan kurikulum Indonesia terbaru, dengan format yang jelas, relevan dengan kurikulum, dan menyesuaikan tingkat kognitif sesuai dengan tingkat kognitif Taksonomi Bloom C1 (Mengingat)-C6 (Mencipta).  
      Soal harus tetap dalam konteks Indonesia, termasuk mata uang, budaya, atau aspek lain yang relevan. Jika pengguna memberikan konteks di luar matematika, sistem harus mengubahnya menjadi soal matematika yang tetap sesuai dengan tingkat SMA.  
      Bila diperlukan referensi gambar, soal harus dapat menyertakan gambar berbentuk SVG, seperti bangun ruang yang dimaksud atau elemen visual lainnya.

      ---
      Return Format:
      Hasil harus selalu dalam format **CSV dengan pemisah "|->"**, yang mencakup kolom:  
      - **judul** → Judul singkat untuk soal.  
      - **deskripsi** → Penjelasan rinci tentang soal dan apa yang perlu diselesaikan.  
      - **jawaban** → Jawaban yang benar, termasuk langkah-langkah penyelesaiannya.  
      - **cabang ilmu** → Cabang ilmu matematika yang relevan (misalnya, Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik).  

      Contoh format:  
      "<judul>|-><deskripsi>|-><jawaban>|-><cabang ilmu>"

      Jika ada rumus atau simbol matematika, gunakan format **LaTeX** atau yang mendukung **rehype-katex** dan **remark-math** agar tampilan lebih baik.  
      Contoh latex:  
      ${latexExample}

      Contoh gambar svg:
      ${svgExample}

      ---
      Warnings:
      - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
      - Jika pengguna memberikan cabang ilmu di luar mata pelajaran selain matematika, ubah konteks tersebut menjadi soal matematika yang tetap sesuai tingkat SMA.  
      - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
      - Jika konteks yang diberikan memerlukan gambar, anda perlu membuat gambar tersebut berbentuk SVG dengan maksimal lebar style="width:200px".
      - Jika konten terdapat LaTex, harus selalu gunakan "$" bagian pembuka dan penutup.
      - **Jangan memberikan respons dalam bentuk teks biasa atau kosong**—semua output harus sesuai dengan format CSV yang telah ditentukan.  
      - Tanda "|->" harus selalu ada 3 jumlahnya agar ketika kondisi parsing tidak error.

      ---
      Context Dump:
      Saya ingin sistem ini beradaptasi dengan format input berikut:  
      "|-[perintah dan aturan]-| |-[tingkat kognitif Taksonomi Bloom]-| |-[tipe soal]-|"

      Misalnya:  
      "|-[Buat soal tentang integral dengan aplikasi dalam ekonomi]-| |-[Tingkat kognitif Taksonomi Bloom C1 (Mengingat)]-| |-[Pilihan Ganda]-|"
      Sistem harus memahami pola ini dan menghasilkan soal matematika yang sesuai.  

      Selain itu, sistem harus dapat menangani berbagai permintaan pengguna dengan fleksibilitas, tetapi tetap menjaga standar akademik SMA Indonesia.  
      ---
     `
    
    // Create an array of message objects with roles and content
    messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kognitif Taksonomi Bloom C1 (Mengingat)]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "<judul>|-><deskripsi>|-><jawaban>|-><cabang ilmu>",
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kognitif Taksonomi Bloom C1 (Mengingat)]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Sistem Persamaan Linear Tiga Variabel|->Diberikan sistem persamaan linear dengan tiga variabel sebagai berikut:\n\n1. $x + 2y + 3z = 14$\n2. $2x - y + z = 6$\n3. $3x + 4y - 2z = 10$\n\nSelesaikan sistem persamaan di atas dan tentukan nilai dari masing-masing variabel: $x$, $y$, dan $z$.|->Langkah penyelesaian:\n\nMenggunakan metode eliminasi dan substitusi untuk sistem persamaan ini:\n\nPertama, kita eliminasi $x$ dari persamaan (1) dan (2) dengan mengalikan (1) dengan 2 dan mengurangkan persamaan (1) baru dari (2):\n\n$2x + 4y + 6z = 28$\n\n$2x - y + z = 6$\n\n--------------------------\n\n$5y + 5z = 22$ $\rightarrow$ (A)\n\nKemudian, eliminasi $x$ dari (1) dan (3) dengan mengalikan (1) dengan 3 dan mengurangkan persamaan (1) baru dari (3):\n\n$3x + 6y + 9z = 42$\n\n$3x + 4y - 2z = 10$\n\n--------------------------\n\n$2y + 11z = 32$ $\rightarrow$ (B)\n\nSekarang, kita memiliki:\n\n(A) $5y + 5z = 22$\n\n(B) $2y + 11z = 32$\n\nDari (A), kita dapatkan $y = 22/5 - z$ dan masukkan ke (B):\n\n$2(22/5 - z) + 11z = 32$\n$44/5 - 2z + 11z = 32$\n$9z = 32 - 44/5$\n$9z = 116/5 - 44/5$\n$9z = 72/5$\n$z = 8/5$\n\nMengganti nilai $z$ ke dalam persamaan (A):\n$5y + 5(8/5) = 22$\n$5y + 8 = 22$\n$5y = 14$\n$y = 14/5$\n\nSekarang mencari nilai $x$ menggantikan $y$ dan $z$ ke dalam (1):\n$x + 2(14/5) + 3(8/5) = 14$\n$x + 28/5 + 24/5 = 14$\n$x + 52/5 = 14$\n$x = 14 - 52/5$\n$x = 70/5 - 52/5$\n\n$x = 18/5$\n\nJadi, solusi dari sistem adalah $x = 18/5$, $y = 14/5$, $z = 8/5$.|->Aljabar",
      },
      {
        role: "user",
        content: "|-[8. Jelaskan konsep induksi matematika dan berikan contoh sederhana tentang bagaimana induksi digunakan untuk membuktikan pernyataan bahwa jumlah n bilangan ganjil pertama adalah n².]-| |-[tingkat kognitif Taksonomi Bloom C1 (Mengingat)]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Induksi Matematika dan Contoh|->Jelaskan konsep induksi matematika dan berikan contoh sederhana tentang bagaimana induksi digunakan untuk membuktikan pernyataan bahwa jumlah n bilangan ganjil pertama adalah n².|->Induksi Matematika adalah metode pembuktian yang digunakan untuk menunjukkan kebenaran suatu pernyataan untuk semua bilangan bulat positif.\n\nProses induksi terdiri dari dua langkah: basis dan langkah induksi. Basis adalah verifikasi bahwa pernyataan tersebut benar untuk bilangan bulat terkecil (biasanya $n = 1$).\n\nLangkah induksi menunjukkan bahwa jika pernyataan benar untuk $n = k$, maka itu juga benar untuk $n = k + 1$.\n\nBerikut adalah contoh penerapan induksi matematika untuk membuktikan bahwa jumlah $n$ bilangan ganjil pertama adalah $n^2$.\n\n**Pernyataan:** Jumlah $n$ bilangan ganjil pertama adalah $n^2$.\n\n**Basis:** Untuk $n = 1$, bilangan ganjil pertama adalah 1, dan $1^2 = 1$. Jadi, pernyataan benar untuk $n = 1$.\n\n**Langkah Induksi:** Asumsikan pernyataan benar untuk $n = k$, yaitu jumlah $k$ bilangan ganjil pertama adalah $k^2$. Tambahkan bilangan ganjil berikutnya, yaitu $2k + 1$, ke jumlah ini:\n\nJumlah untuk $k + 1$ bilangan ganjil pertama = $k^2 + (2k + 1)$.\n\nSederhanakan: $k^2 + 2k + 1 = (k + 1)^2$.\n\nIni membuktikan bahwa jika pernyataan benar untuk $n = k$, maka juga benar untuk $n = k + 1$.\n\nOleh karena itu, dengan prinsip induksi matematika, pernyataan tersebut benar untuk semua bilangan bulat positif $n$.|->Aljabar",
      },
      {
        role: "user",
        content: "|-[17. Tentukan nilai limit dari $f(x) = \\frac{x^2 - 1}{x - 1}$ saat $x$ mendekati 1.]-| |-[tingkat kognitif Taksonomi Bloom C3 (Menerapkan)]-| |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: "Limit Fungsi|->Tentukan nilai limit dari $f(x) = \\frac{x^2 - 1}{x - 1}$ saat $x$ mendekati 1 adalah...\n\nA. 0\nB. 1\nC. 2\nD. Tidak terdefinisi\n\\\n\E. 3|->Untuk menentukan limit tersebut, kita dapat menyederhanakan fungsi terlebih dahulu. Fungsi $f(x) = \\frac{x^2 - 1}{x - 1}$ dapat difaktorkan sebagai berikut:\n\n$$f(x) = \\frac{(x - 1)(x + 1)}{x - 1}$$\n\nDengan mengeliminasi faktor $(x - 1)$ yang sama di pembilang dan penyebut, kita mendapatkan:\n\n$$f(x) = x + 1$$\n\nSekarang kita dapat menghitung limitnya saat $x$ mendekati 1:\n\n$$\lim_{{x \to 1}} (x + 1) = 1 + 1 = 2$$\n\nJadi, nilai limit dari $f(x)$ saat $x$ mendekati 1 adalah 2. Jawaban yang benar adalah C. 2.|->Kalkulus",
      },
      {
        role: "user",
        content: "|-[tebak gambar bangun ruang]-| |-[tingkat kognitif Taksonomi Bloom C6 (Mencipta)]-| |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: `Tebak Gambar Bangun Ruang|->Pada gambar di bawah ini terdapat sebuah bangun ruang. Sebutkan nama bangun ruang tersebut.\n\n<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">\n<line x1="100" y1="20" x2="30" y2="200" stroke="black" stroke-width="2"/>\n<line x1="100" y1="20" x2="170" y2="200" stroke="black" stroke-width="2"/>\n<path d="M30 200 Q100 230 170 200" stroke="black" fill="none" stroke-width="2"/>\n<path d="M170 200 Q100 170 30 200" stroke="black" fill="none" stroke-dasharray="6,4" stroke-width="2"/>\n</svg>\n\nJawaban yang tepat adalah...\n\nA. Kubus\n\nB. Balok\n\nC. Kerucut\n\nD. Limas Segiempat\n\nE. Tabung|->Bangun ruang yang ditampilkan pada gambar adalah sebuah Kerucut.\n\nKarakteristik dari kerucut adalah sebagai berikut:\n\n1. Kerucut memiliki satu sisi alas berbentuk lingkaran.\n2. Memiliki satu titik puncak yang tidak berada pada bidang alas.\n3. Selimut kerucut berbentuk bidang lengkung yang menghubungkan tepi alas dengan titik puncak.\n4. Volume kerucut dapat dihitung dengan rumus: $$V = \\frac{1}{3} \\pi r^2 h$$ di mana $r$ adalah jari-jari alas dan $h$ adalah tinggi kerucut.\n5. Luas permukaan kerucut terdiri dari luas alas dan luas selimut, yang dapat dihitung dengan rumus: $$A = \pi r (r + s)$$ di mana $s$ adalah garis pelukis kerucut.\n\nKerucut banyak ditemukan dalam kehidupan sehari-hari, seperti pada bentuk topi ulang tahun atau es krim cone. Berdasarkan karakteristik tersebut, bangun ruang ini adalah:\n\nJawaban yang benar adalah C. Kerucut.|->Geometri`,
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[tingkat kognitif Taksonomi Bloom ${difficulty}]-| |-[bertipe ${type}]-|`,
      },
    ];
  } else  {
    systemPrompt = `
    ---
    Goal:
    Saya ingin sebuah sistem yang dapat membuat daftar ide soal matematika tingkat Sekolah Menengah Atas (SMA) menggunakan kurikulum Indonesia terbaru. Ide soal harus jelas, sesuai kurikulum, dan menyesuaikan tingkat kognitif berdasarkan tingkat kognitif Taksonomi Bloom C1 (Mengingat)-C6 (Mencipta).  
    Soal harus tetap dalam konteks Indonesia, termasuk mata uang, budaya, atau aspek lain yang relevan. Jika pengguna memberikan konteks di luar matematika, sistem harus mengubahnya menjadi ide soal matematika yang tetap sesuai dengan tingkat SMA.  
    Bila diperlukan referensi gambar, soal harus dapat menyertakan gambar berbentuk SVG, seperti bangun ruang yang dimaksud atau elemen visual lainnya.
    
    ---
    Return Format:
    Hasil harus selalu dalam format **CSV dengan pemisah "|->" dan "<_>"**, yang mencakup kolom:  
    - **prompt** → Menjelaskan ide soal yang akan dibuat, serta memberikan penjabaran lebih detail mengenai soal tersebut, seperti tipe soal soal.  
    - **tingkat kognitif** → tingkat kognitif soal, yang HANYA bisa berupa tingkat kognitif Taksonomi Bloom C1 (Mengingat) hingga C6 (Mencipta).  
    - **tipe soal** → Jenis soal, yang HANYA bisa berupa "Esai" atau "PG" (Pilihan Ganda).  
    
    Contoh format soal hanya satu:  
    "<prompt>|-><tingkat kognitif>|-><tipe soal>"
    
    Contoh format soal kebih dari satu:  
    "<prompt>|-><tingkat kognitif>|-><tipe soal><_><prompt>|-><tingkat kognitif>|-><tipe soal>"
    
    Jika ada rumus atau simbol matematika, gunakan format **LaTeX** atau yang mendukung **rehype-katex** dan **remark-math** agar tampilan lebih baik.  
    Contoh latex:  
    ${latexExample}

    Contoh gambar svg:
    ${svgExample}
    
    ---
    Warnings:
    - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
    - Jika pengguna memberikan cabang ilmu di luar mata pelajaran selain matematika, ubah konteks tersebut menjadi soal matematika yang tetap sesuai tingkat SMA.  
    - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
    - Jika konteks yang diberikan memerlukan gambar, anda perlu membuat gambar tersebut berbentuk SVG dengan maksimal lebar style="width:200px".
    - Jika konten terdapat LaTex, harus selalu gunakan "$" bagian pembuka dan penutup.
    - **Jangan memberikan respons dalam bentuk teks biasa atau kosong**—semua output harus sesuai dengan format CSV yang telah ditentukan.  
    
    ---
    Context Dump:
    Saya ingin sistem ini beradaptasi dengan format input berikut:  
    "|-[perintah dan aturan]-| |-[referensi pengetahuan dan aturan seperti kurikulum atau rencana pembelajaran yang perlu diuji]-| |-[tingkat kognitif Taksonomi Bloom]-| |-[tipe soal]-| |-[jumlah soal]-|"
    
    Misalnya:  
    "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|"
    Sistem harus memahami pola ini dan menghasilkan daftar ide soal yang sesuai.  
    
    Sistem harus mampu menangani berbagai permintaan pengguna dengan fleksibilitas, tetapi tetap menjaga standar akademik SMA Indonesia.  
    ---
    `    
    messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 1 sampai nomor 5]-|",
      },
      {
        role: "assistant",
        content: "1. <prompt>|-><tingkat kognitif>|-><tipe soal><_>2. <prompt>|-><tingkat kognitif>|-><tipe soal><_>3. <prompt>|-><tingkat kognitif>|-><tipe soal><_>4. <prompt>|-><tingkat kognitif>|-><tipe soal><_>5. <prompt>|-><tingkat kognitif>|-><tipe soal>",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 1 sampai nomor 5]-|",
      },
      {
        role: "assistant",
        content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|->C2 (Memahami)|->Esai<_>2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|->C1 (Mengingat)|->Esai<_>3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|->C3 (Menerapkan)|->PG<_>4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|->C1 (Mengingat)|->PG<_>5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|->C2 (Memahami)|->Esai",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[soal mulai dari nomor 6 sampai nomor 6]-|",
      },
      {
        role: "assistant",
        content: "<_>6. Menghitung hasil dari $$7 + 5 \\times 2$$. Tuliskan dengan urutan operasi yang benar (PEMDAS/BODMAS).|->C1 (Mengingat)|->PG",
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[${reference}]-| |-[tingkat kognitif Taksonomi Bloom ${difficulty}]-| |-[bertipe ${type}]-| |-[soal mulai dari nomor ${range.start} sampai nomor ${range.end}]-|`,
      },
    ];
  }

  return messages;
}
