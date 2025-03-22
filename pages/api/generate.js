
require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

let client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const {prompt, mode, difficuly, reference, type, total}  = req.body || '';
  const body = {
      prompt,
      mode,
      difficuly,
      reference,
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
        max_tokens: 16384,
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
  const reference = data?.reference || "tidak ada"; 
  const difficulty = data?.difficuly || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";
  const latexExample = `
    "$$A = \\begin{bmatrix} 2 & 3 & 1 \\ 4 & 0 & -1 \\ 5 & 2 & 3 \\end{bmatrix}$$"
    "$$\\frac{1}{2} + \\frac{1}{4} - \\frac{1}{8}$$."
    "f(x) = $\\frac{x^2 - 1}{x - 1}$ saat  (x)"
    "$$d = \\sqrt{25}$$"
    "$[\\begin{array}{c}10,7 \\\\\\end{array}]$"
    "$$\n
      \\begin{array}{r}
          345 \\\
      +  678 \\\
      \\hline
          ??? \\\
      \\end{array}\n
      $$"
    "$$\\text{Volume} = \\text{panjang} \\times \\text{lebar} \\times \\text{tinggi}$$"
    "$$\n
    A = \\begin{bmatrix} 
    a_{11} & a_{12} & a_{13} \\\
    a_{21} & a_{22} & a_{23} \\\
    \\end{bmatrix}\n
    $$"
    "$(A \\times B)$"
  `

  let systemPrompt;
  let messages;

  if(data?.mode === "detail"){
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
      - **topik** → Topik matematika yang relevan (misalnya, Aljabar, Geometri, Trigonometri, Kalkulus, atau Statistik).  

      Contoh format:  
      "judul|->deskripsi|->jawaban|->topik"

      Jika ada rumus atau simbol matematika, gunakan format **LaTeX** atau yang mendukung **rehype-katex** dan **remark-math** agar tampilan lebih baik.  
      Contoh latex:  
      ${latexExample}

      ---
      Warnings:
      - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
      - Jika pengguna memberikan topik di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi soal matematika yang tetap sesuai tingkat SMA.  
      - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
      - Jika konteks yang diberikan memerlukan gambar, anda perlu membuat gambar tersebut berbentuk SVG dengan maksimal lebar style="width:200px".
      - **Jangan memberikan respons dalam bentuk teks biasa atau kosong**—semua output harus sesuai dengan format CSV yang telah ditentukan.  
      - Tanda "|->" harus selalu ada 3 jumlahnya agar ketika kondisi parsing tidak error.

      ---
      Context Dump:
      Saya ingin sistem ini beradaptasi dengan format input berikut:  
      "|-[perintah dan aturan]-| |-[tingkat kognitif Taksonomi Bloom]-| |-[tipe soal]-|"

      Misalnya:  
      "|-[Buat soal tentang integral dengan aplikasi dalam ekonomi]-| |-[Tingkat sulit]-| |-[Pilihan Ganda]-|"
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
        content: "<judul>|-><deskripsi>|-><jawaban>|-><topik>",
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kognitif Taksonomi Bloom C1 (Mengingat)]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Sistem Persamaan Linear Tiga Variabel|->Diberikan sistem persamaan linear dengan tiga variabel sebagai berikut:\n\n1. $x + 2y + 3z = 14$\n\n2. $2x - y + z = 6$\n\n3. $3x + 4y - 2z = 10$\n\nSelesaikan sistem persamaan di atas dan tentukan nilai dari masing-masing variabel: $x$, $y$, dan $z$.|->Langkah penyelesaian:\n\nMenggunakan metode eliminasi dan substitusi untuk sistem persamaan ini:\n\nPertama, kita eliminasi $x$ dari persamaan (1) dan (2) dengan mengalikan (1) dengan 2 dan mengurangkan persamaan (1) baru dari (2):\n\n$2x + 4y + 6z = 28$\n\n$2x - y + z = 6$\n\n--------------------------\n\n$5y + 5z = 22$ $\rightarrow$ (A)\n\nKemudian, eliminasi $x$ dari (1) dan (3) dengan mengalikan (1) dengan 3 dan mengurangkan persamaan (1) baru dari (3):\n\n$3x + 6y + 9z = 42$\n\n$3x + 4y - 2z = 10$\n\n--------------------------\n\n$2y + 11z = 32$ $\rightarrow$ (B)\n\nSekarang, kita memiliki:\n\n(A) $5y + 5z = 22$\n\n(B) $2y + 11z = 32$\n\nDari (A), kita dapatkan $y = 22/5 - z$ dan masukkan ke (B):\n\n$2(22/5 - z) + 11z = 32$\n$44/5 - 2z + 11z = 32$\n$9z = 32 - 44/5$\n$9z = 116/5 - 44/5$\n$9z = 72/5$\n$z = 8/5$\n\nMengganti nilai $z$ ke dalam persamaan (A):\n$5y + 5(8/5) = 22$\n$5y + 8 = 22$\n$5y = 14$\n$y = 14/5$\n\nSekarang mencari nilai $x$ menggantikan $y$ dan $z$ ke dalam (1):\n$x + 2(14/5) + 3(8/5) = 14$\n$x + 28/5 + 24/5 = 14$\n$x + 52/5 = 14$\n$x = 14 - 52/5$\n$x = 70/5 - 52/5$\n\n$x = 18/5$\n\nJadi, solusi dari sistem adalah $x = 18/5$, $y = 14/5$, $z = 8/5$.|->Aljabar",
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
        content: "Limit Fungsi|->Tentukan nilai limit dari $f(x) = \\frac{x^2 - 1}{x - 1}$ saat $x$ mendekati 1. Pilihan jawaban:\n\\\nA. 0\n\\\nB. 1\n\\\nC. 2\n\\\nD. Tidak terdefinisi\n\\\n\E. 3|->Untuk menentukan limit tersebut, kita dapat menyederhanakan fungsi terlebih dahulu. Fungsi $f(x) = \\frac{x^2 - 1}{x - 1}$ dapat difaktorkan sebagai berikut:\n\n$$f(x) = \\frac{(x - 1)(x + 1)}{x - 1}$$\n\nDengan mengeliminasi faktor $(x - 1)$ yang sama di pembilang dan penyebut, kita mendapatkan:\n\n$$f(x) = x + 1$$\n\nSekarang kita dapat menghitung limitnya saat $x$ mendekati 1:\n\n$$\lim_{{x \to 1}} (x + 1) = 1 + 1 = 2$$\n\nJadi, nilai limit dari $f(x)$ saat $x$ mendekati 1 adalah 2. Jawaban yang benar adalah C. 2.|->Kalkulus",
      },
      {
        role: "user",
        content: "|-[tebak gambar bangun ruang]-| |-[tingkat kognitif Taksonomi Bloom C6 (Mencipta)]-| |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: `Tebak Gambar Bangun Ruang|->Pada gambar di bawah ini terdapat sebuah bangun ruang. Pilihlah nama bangun ruang yang tepat berdasarkan gambar tersebut.\n\n<svg style="width:200px;" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" id="Layer_1" viewBox="0 0 100 100"><title/><path d="M94.92371,5.61914A1.0028,1.0028,0,0,0,94,5H30a1.0065,1.0065,0,0,0-.70715.29291l-24,24A1.01,1.01,0,0,0,5,30.00031V94a1,1,0,0,0,1,1H70l.0105-.00214a.9962.9962,0,0,0,.69659-.29077l24-24A1.01425,1.01425,0,0,0,95,70V6A1.00069,1.00069,0,0,0,94.92371,5.61914ZM29.06958,8.3446A.9951.9951,0,0,0,31,8V7H91.58575l-22,22H8.41418ZM8.30005,93A.99924.99924,0,0,0,7,91.69989V31H29v1a1,1,0,0,0,2,0V31H69V69H68a1,1,0,0,0,0,2h1V93ZM71,30.41418,92.99994,8.41425,93,69H92a.99512.99512,0,0,0-.34467,1.93042L71,91.58575Z"/><path d="M30,61a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V62A1,1,0,0,0,30,61Z"/><path d="M30,53a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V54A1,1,0,0,0,30,53Z"/><path d="M30,17a1,1,0,0,0,1-1V14a1,1,0,0,0-2,0v2A1,1,0,0,0,30,17Z"/><path d="M30,45a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V46A1,1,0,0,0,30,45Z"/><path d="M31,24V22a1,1,0,0,0-2,0v2a1,1,0,0,0,2,0Z"/><path d="M30,37a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V38A1,1,0,0,0,30,37Z"/><path d="M54,69H52a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M62,69H60a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M78,69H76a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M86,69H84a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M46,69H44a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M38,69H36a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z"/><path d="M30.92279,69.6178a.99931.99931,0,0,0-1.626-.32752l-.004.00263L27.8786,70.70709a1,1,0,1,0,1.41425,1.41419l1.41424-1.41419a1.00368,1.00368,0,0,0,.2157-1.08929Z"/><path d="M23.636,74.94971,22.22174,76.364A1,1,0,0,0,23.636,77.77814L25.05023,76.364A1,1,0,0,0,23.636,74.94971Z"/><path d="M17.97913,80.60657l-1.41425,1.41424A1,1,0,0,0,17.97913,83.435l1.41424-1.41419a1,1,0,0,0-1.41424-1.41424Z"/><path d="M12.32227,86.26343,10.908,87.67767a1,1,0,0,0,1.41425,1.41419l1.41424-1.41425a1,1,0,1,0-1.41424-1.41418Z"/></svg>\n\nPilihan jawaban:\n\\\nA. Kubus\n\\\nB. Balok\n\\\nC. Prisma Segitiga\n\\\nD. Limas Segiempat\n\\\nE. Tabung|->Misalkan gambar menunjukkan sebuah bangun ruang yang memiliki enam sisi yang semuanya berbentuk persegi dan sama besar. Berdasarkan karakteristik tersebut, bangun ruang ini adalah:\n\nJawaban yang benar adalah A. Kubus.|->Geometri`,
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
    Hasil harus selalu dalam format **CSV dengan pemisah "|->"**, yang mencakup kolom:  
    - **prompt** → Menjelaskan ide soal yang akan dibuat, serta memberikan penjabaran lebih detail mengenai soal tersebut, seperti jenis soal.  
    - **tingkat kognitif** → tingkat kognitif soal, yang HANYA bisa berupa tingkat kognitif Taksonomi Bloom C1 (Mengingat) hingga C6 (Mencipta).  
    - **jenis** → Jenis soal, yang HANYA bisa berupa "Esai" atau "PG" (Pilihan Ganda).  
    
    Contoh format:  
    "<prompt>|-><tingkat kognitif>|-><jenis>"
    
    Jika ada rumus atau simbol matematika, gunakan format **LaTeX** atau yang mendukung **rehype-katex** dan **remark-math** agar tampilan lebih baik.  
    Contoh latex:  
    ${latexExample}
    
    ---
    Warnings:
    - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
    - Jika pengguna memberikan topik di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi ide soal matematika yang tetap sesuai tingkat SMA.  
    - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
    - Jika konteks yang diberikan memerlukan gambar, anda perlu membuat gambar tersebut berbentuk SVG dengan maksimal lebar style="width:200px".
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
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|",
      },
      {
        role: "assistant",
        content: "1. <prompt>|-><tingkat kognitif>|-><jenis><_>2. <prompt>|-><tingkat kognitif>|-><jenis><_>3. <prompt>|-><tingkat kognitif>|-><jenis><_>4. <prompt>|-><tingkat kognitif>|-><jenis><_>5. <prompt>|-><tingkat kognitif>|-><jenis>",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|",
      },
      {
        role: "assistant",
        content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|->C2 (Memahami)|->Esai<_>2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|->C1 (Mengingat)|->Esai<_>3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|->C3 (Menerapkan)|->PG<_>4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|->C1 (Mengingat)|->PG<_>5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|->C2 (Memahami)|->Esai",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kognitif Taksonomi Bloom Acak]-| |-[bertipe Acak]-| |-[jumlah 100 soal]-|",
      },
      {
        role: "assistant",
        content: "1. Menghitung hasil dari $$7 + 5 \\times 2$$. Tuliskan dengan urutan operasi yang benar (PEMDAS/BODMAS).|->C1 (Mengingat)|->PG<_>2. Sebuah mobil menempuh jarak 120 km dalam waktu 2 jam. Berapakah kecepatan rata-ratanya dalam km/jam?|->C2 (Memahami)|->Esai<_>3. Tentukan nilai x jika $$3x + 5 = 20$$.|->C1 (Mengingat)|->PG<_>4. Jika sebuah keran mengisi air sebanyak 15 liter per menit, berapa liter air yang akan terisi dalam waktu 8 menit?|->C1 (Mengingat)|->Esai<_>5. Apa hasil dari 3/4 dikurangi 1/2? Ubah dalam bentuk desimal 2 tempat.|->C1 (Mengingat)|->PG<_>6. Gambarkan grafik fungsi linear $$y = 2x + 1$$ dan tentukan titik potong pada sumbu y.|->C4 (Menganalisis)|->Esai<_>7. Diketahui luas persegi adalah 64 cm². Tentukan kelilingnya.|->C1 (Mengingat)|->PG<_>8. Hitunglah persentase dari 50 jika diketahui bahwa persentase dari 60 adalah 30%.|->C3 (Menerapkan)|->Esai<_>9. Dalam sebuah kelas terdapat 40 siswa, 25 di antaranya menyukai matematika. Berapakah persentase siswa yang tidak menyukai matematika?|->C2 (Memahami)|->PG<_>10. Jika harga sebuah buku Rp50.000 setelah diskon 20%, berapakah harga sebelum diskon?|->C4 (Menganalisis)|->Esai<_>11. Temukan FPB dari bilangan 48 dan 60.|->C1 (Mengingat)|->PG<_>12. Andrea membeli 3 kg apel dan 2 kg jeruk. Jika harga apel Rp12.000/kg dan jeruk Rp10.000/kg, berapakah total biaya yang dikeluarkan Andrea?|->C3 (Menerapkan)|->Esai<_>13. Konversikan suhu 100 derajat Celsius ke Fahrenheit.|->C2 (Memahami)|->PG<_>14. Tentukan nilai dari $$\\frac{1}{2} + \\frac{1}{4} - \\frac{1}{8}$$.|->C3 (Menerapkan)|->Esai<_>15. Sebuah persegi panjang memiliki panjang 10 cm dan lebar 5 cm. Tentukan luas dan kelilingnya.|->C2 (Memahami)|->PG<_>16. Tentukan nilai maximum dari fungsi kuadrat $$y = -x^2 + 4x + 3$$.|->C5 (Mengevaluasi)|->Esai<_>17. Seorang petani memiliki sejumlah telur yang akan dimasukkan ke dalam kotak-kotak. Setiap kotak menampung 12 telur. Jika terdapat 200 telur, berapa kotak yang dibutuhkan?|->C1 (Mengingat)|->PG<_>18. Hitung hasil dari $$\\\\sqrt{16} \\times 5 + 10$$.|->C2 (Memahami)|->PG<_>19. Selesaikan sistem persamaan berikut: $$x + y = 10$$ dan $$x - y = 2$$.|->C3 (Menerapkan)|->Esai<_>20. Sebuah tangki penuh mengandung 500 liter air. Jika air dikeluarkan dengan kecepatan 20 liter/menit, berapa menit yang dibutuhkan untuk mengosongkan tangki itu?|->C3 (Menerapkan)|->PG<_>21. Dalam suatu undian terdapat 12 bola merah, 8 hijau, dan 5 biru. Jika satu bola diambil secara acak, berapakah peluang mendapatkan bola hijau?|->C4 (Menganalisis)|->Esai<_>22. Tentukan nilai dari $$5^0$$ dan jelaskan alasannya.|->C2 (Memahami)|->PG<_>23. If $$2x + 3 < 7$$, tentukan rentang nilai x.|->C4 (Menganalisis)|->Esai<_>24. Apa beda antara median dan rata-rata dari sekumpulan data? Beri contoh sederhana.|->C2 (Memahami)|->PG<_>25. Konversikan 2500 ml ke liter.|->C1 (Mengingat)|->Esai<_>26. Tentukan jumlah sudut dalam (interior) dari segitiga.|->C1 (Mengingat)|->PG<_>27. Seorang siswa mendapat nilai 70 pada tiga ujian pertama. Berapa nilai yang harus didapatkannya pada ujian keempat agar rata-ratanya menjadi 75?|->C5 (Mengevaluasi)|->Esai<_>28. Jika panjang diagonal persegi adalah 10√2 cm, berapakah panjang sisi persegi tersebut?|->C3 (Menerapkan)|->PG<_>29. Dalam perjalanan bersepeda, Ani bersepeda dengan kecepatan rata-rata 15 km/jam selama 3 jam. Berapakah jarak total yang ditempuh Ani?|->C1 (Mengingat)|->Esai<_>30. Sebuah saku baju mengandung 5 koin seribu, 3 koin lima ratus, dan 2 koin dua ratus. Berapakah total uang di dalam saku tersebut?|->C2 (Memahami)|->PG<_>31. Sebuah pabrik memproduksi 150 unit barang setiap hari. Tentukan jumlah produksi selama sebulan (30 hari).|->C1 (Mengingat)|->Esai<_>32. Apa hasil dari $$\\frac{7}{9} \\times \\frac{2}{3}$$? Ubah ke bentuk desimal.|->C3 (Menerapkan)|->PG<_>33. Tentukan volume balok dengan panjang 8 cm, lebar 5 cm, dan tinggi 2 cm.|->C2 (Memahami)|->Esai<_>34. Hitung nilai rata-rata dari kumpulan data berikut: 4, 8, 10, 16, 18.|->C2 (Memahami)|->PG<_>35. Dalam sebuah kelas, 60% siswa adalah laki-laki. Jika jumlah total siswa adalah 50, berapakah jumlah siswa perempuan?|->C2 (Memahami)|->Esai<_>36. Sebuah perusahaan meminjam Rp2.000.000 dengan bunga 5% per tahun. Hitung total bunga setelah satu tahun.|->C2 (Memahami)|->PG<_>37. Jika $$x = 3$$ dan $$y = 4$$, hitunglah nilai dari $$x^2 + y^2$$.|->C3 (Menerapkan)|->Esai<_>38. Tentukan persamaan garis yang melalui titik (2, 3) dengan gradien (kemiringan) -1.|->C4 (Menganalisis)|->PG<_>39. Dalam sebuah kantin, 40% dari 300 pengunjung memesan makanan cepat saji. Berapakah jumlah pengunjung yang memesan makanan lainnya?|->C2 (Memahami)|->Esai<_>40. Sederhanakan ungkapan $$4x - 2(3x - 5)$$.|->C3 (Menerapkan)|->PG<_>41. Hitunglah panjang sisi miring segitiga siku-siku yang alasnya 6 cm dan tingginya 8 cm.|->C3 (Menerapkan)|->Esai<_>42. Berapakah sudut terkecil dalam segitiga sama kaki dengan satu sudut sebesar 40°?|->C4 (Menganalisis)|->PG<_>43. Sebuah botol dapat menampung 1.5 liter air. Berapa banyak botol yang dibutuhkan untuk menampung 9 liter air?|->C1 (Mengingat)|->Esai<_>44. Jika luas lingkaran adalah 154 cm², carilah jari-jari lingkaran tersebut. (Gunakan $(\\pi = 3.14)$)|->C3 (Menerapkan)|->PG<_>45. Tentukan hasil dari operasi matematika berikut: $$2 + 3 \\times (8 - 5)$$.|->C2 (Memahami)|->Esai<_>46. Jika sebuah produk dijual dengan harga awal Rp75.000 dan mengalami penurunan harga menjadi Rp67.500, berapa persentase penurunan harga tersebut?|->C4 (Menganalisis)|->PG<_>47. Seorang pejalan kaki melangkah 75 langkah per menit. Jika ia berjalan selama 20 menit, berapa langkah total yang telah dilakukannya?|->C1 (Mengingat)|->Esai<_>48. Jika segitiga sama sisi memiliki keliling 90 cm, tentukan panjang satu sisinya.|->C2 (Memahami)|->PG<_>49. Tentukan operasi yang dilakukan jika Anda ingin menambahkan 25% dari sebuah nilai ke nilai tersebut.|->C3 (Menerapkan)|->Esai<_>50. Sebuah limas segi empat dengan panjang alas 10 cm dan tinggi 15 cm memiliki luas alas sama dengan luas segitiga samping. Tentukan luas segitiga samping tersebut.|->C5 (Mengevaluasi)|->PG<_>51. Jika $(f(x) = 2x + 7)$, tentukan $(f(3))$.|->C2 (Memahami)|->Esai<_>52. Selesaikan persamaan berikut: $$\\frac{2x}{3} = 6$$.|->C3 (Menerapkan)|->PG<_>53. Seorang siswa belajar selama 5 hari dalam seminggu. Jika setiap harinya belajar selama 2 jam, berapa total jam belajar selama satu minggu?|->C1 (Mengingat)|->PG<_>54. Dalam kurva distribusi normal, tentukan letak mean, median, dan modus.|->C4 (Menganalisis)|->Esai<_>55. Tentukan titik tengah dari segmen garis dengan titik akhir (2, -3) dan (8, 5).|->C4 (Menganalisis)|->PG<_>56. Tentukan hasil dari $$10!/\\left( 8! \\times 2! \\right)$$.|->C5 (Mengevaluasi)|->Esai<_>57. Dalam pemetaan fungsi $(g(x) = x^2 - 5x + 6)$, tentukan nilai $(g(2))$.|->C3 (Menerapkan)|->PG<_>58. Carilah bilangan yang didapatkan ketika menambahkan 250 ke 3/4 dari bilangan aslinya sehingga hasilnya menjadi 550.|->C6 (Mencipta)|->PG<_>59. Berapakah hasil dari $$\\log_2{8}$$?|->C2 (Memahami)|->Esai<_>60. Tentukan hasil penjumlahan $(\\frac{1}{6} + \\frac{1}{3} + \\frac{1}{4})$ setelah diubah ke pecahan biasa.|->C3 (Menerapkan)|->PG<_>61. Dalam ruang tiga dimensi, berapakah jumlah diagonal ruang yang dimiliki oleh balok?|->C2 (Memahami)|->Esai<_>62. Dalam sebuah jam, apa sudut terkecil yang terbentuk antara jarum jam dan jarum menit ketika menunjukkan pukul 3.15?|->C4 (Menganalisis)|->PG<_>63. Sederhanakan ekspresi $(5x - 3y + 2 - (4x - 2y + 5))$.|->C3 (Menerapkan)|->Esai<_>64. Diketahui dua bilangan memiliki produk 48 dan salah satunya diketahui 6, berapakah bilangan lainnya?|->C1 (Mengingat)|->PG<_>65. Sebuah generator listrik menggunakan daya 30 kW dalam 5 jam. Berapakah energi yang dikonsumsi dalam kWh?|->C2 (Memahami)|->Esai<_>66. Sebuah komet berada pada 0.5 satuan cahaya dari bumi. Jika kecepatannya konstan yaitu 0.1 satuan cahaya/tahun, dalam berapa tahun komet tersebut mencapai bumi?|->C4 (Menganalisis)|->PG<_>67. Tentukan akar-akar dari persamaan kuadrat $(x^2 - 5x + 6 = 0)$.|->C3 (Menerapkan)|->Esai<_>68. Sebuah balok memiliki volume 240 cm³, panjangnya 10 cm, dan lebar 4 cm. Tentukan tinggi balok tersebut.|->C2 (Memahami)|->PG<_>69. Hitung panjang lintasan sebuah siklus penuh lingkaran dengan jari-jari 7 cm (gunakan $(\\pi = 22/7)$).|->C2 (Memahami)|->Esai<_>70. Dalam arisan, terdapat 15 orang dan akan ditarik setiap bulan, berapa bulan diperlukan untuk setiap orang mendapat giliran undian?|->C1 (Mengingat)|->PG<_>71. Temukan dua angka yang jumlahnya 50 dan selisihnya 14.|->C4 (Menganalisis)|->Esai<_>72. Tentukan nilai sin 30°, cos 60°, dan tan 45°.|->C1 (Mengingat)|->PG<_>73. Sebuah toko menjual baju dengan harga netto Rp250.000 setelah dikenakan pajak 10%. Berapakah harga sebelum pajak?|->C5 (Mengevaluasi)|->Esai<_>74. Hitung luas dari titik pusat lingkaran di dalam ruang koordinat kartesian (0,0).|->C6 (Mencipta)|->PG<_>75. Konversikan 1200 detik menjadi menit dan detik.|->C1 (Mengingat)|->Esai<_>76. Temukan panjang sebenarnya jika pada peta 1 cm mewakili 5 km dan jarak pada peta adalah 15 cm.|->C2 (Memahami)|->PG<_>77. Sebuah kue potongan memiliki luas bagian permukaan 154 cm². Jika ini berbentuk lingkaran, tentukan radius kue tersebut ($(\\pi = 3.14)$).|->C3 (Menerapkan)|->Esai<_>78. Jika $(f(x) = 3x - 4)$ dan $(g(x) = x + 2)$, temukan $(f \\circ g)(x)$.|->C3 (Menerapkan)|->PG<_>79. Jika $3^{x+2} = 9$, berapakah nilai x?|->C4 (Menganalisis)|->Esai<_>80. Dalam komunitas sosial, 70% anggota setuju dengan kebijakan baru. Jika ada 200 anggota, berapa banyak yang tidak setuju?|->C2 (Memahami)|->PG<_>81. Perguruan tinggi memiliki 500 kursi dan 40% dari kursi tersebut dialokasikan untuk beasiswa. Berapa banyak kursi yang dialokasikan?|->C2 (Memahami)|->Esai<_>82. Jika $a + b = 10$ dan $a - b = 2$, tentukan nilai a dan b.|->C3 (Menerapkan)|->PG<_>83. Tentukan volume dari sebuah tabung dengan jari-jari 7 cm dan tinggi 20 cm (gunakan $\\pi = 22/7$).|->C2 (Memahami)|->PG<_>84. Carilah bilangan ganjil yang jika dibagi 5 memberikan sisa 3.|->C6 (Mencipta)|->Esai<_>85. Calculate the area of a trapezium with parallel sides of lengths 8 cm and 10 cm, and a height of 6 cm.|->C3 (Menerapkan)|->PG<_>86. Jika 18 kotak krayon bisa mengisi habis 3 rak di rak pamer, berapa banyak kotak krayon yang diperlukan untuk mengisi 5 rak?|->C3 (Menerapkan)|->Esai<_>87. Jika sebuah uang koin dilempar tiga kali, tentukan semua hasil kombinasi yang mungkin (misalnya, HHH, HHT, dll).|->C4 (Menganalisis)|->PG<_>88. Carilah bilangan kelipatan dari 6 yang terletak antara 30 dan 60.|->C3 (Menerapkan)|->Esai<_>89. Tentukan hasil dari operasi $$25 \\times 4 \\div 2 + 10 - 5$$ menggunakan prioritas operasi.|->C2 (Memahami)|->PG<_>90. Ada 100 orang yang berpartisipasi dalam tes menulis, dan 75 dari mereka lulus. Berapakah nilai persentase kelulusan?|->C1 (Mengingat)|->Esai<_>91. Sebuah tiket konsert dijual seharga Rp250.000. Jika terdapat tambahan biaya administrasi 5%, berapakah total biaya yang harus dibayar?|->C5 (Mengevaluasi)|->PG<_>92. Konversikan 8 meter menjadi sentimeter.|->C1 (Mengingat)|->PG<_>93. Jika persamaan lingkaran adalah $x^2 + y^2 = 25$, berapakah panjang diameter lingkaran tersebut?|->C3 (Menerapkan)|->Esai<_>94. Temukan bilangan yang ketika dikalikandengan 8 hasilnya adalah 72.|->C1 (Mengingat)|->PG<_>95. Jika 3 pangkat x sama dengan 9, tentukan nilai x.|->C2 (Memahami)|->Esai<_>96. Temukan rata-rata dari kumpulan data berikut: 70, 85, 65, 90, 75.|->C2 (Memahami)|->PG<_>97. Dalam sebuah festival seni, jumlah peserta pria lebih banyak 20% daripada wanita, dan jumlah wanita ada 80 orang. Berapa jumlah total peserta pria?|->C3 (Menerapkan)|->Esai<_>98. Sebuah buku memiliki 500 halaman, dan seorang siswa membaca 20 halaman sehari. Berapa hari yang diperlukan untuk menyelesaikan buku tersebut?|->C1 (Mengingat)|->PG<_>99. Jika kamu menabung Rp500 per hari, berapa banyak yang akan kamu miliki dalam 6 bulan (anggap sebulan terdiri dari 30 hari)?|->C2 (Memahami)|->Esai<_>100. Jika persediaan beras akan cukup untuk 60 orang selama 3 minggu, berapa lama persediaan itu cukup untuk 90 orang jika tingkat konsumsi tetap?|->C4 (Menganalisis)|->PG",
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[${reference}]-| |-[tingkat kognitif Taksonomi Bloom ${difficulty}]-| |-[bertipe ${type}]-| |-[jumlah ${total} soal]-|`,
      },
    ];
  }

  return messages;
}
