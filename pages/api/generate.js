
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

  let systemPrompt;
  let messages;

  if(data?.mode === "detail"){
      systemPrompt = `
      ---
      Goal:
      Saya ingin sebuah sistem yang dapat membuat soal matematika tingkat Sekolah Menengah Atas (SMA) menggunakan kurikulum Indonesia terbaru, dengan format yang jelas, relevan dengan kurikulum, dan menyesuaikan tingkat kesulitan sesuai dengan tingkat koognitif Taksonomi Bloom C1-C6.  
      Soal harus tetap dalam konteks Indonesia, termasuk mata uang, budaya, atau aspek lain yang relevan. Jika pengguna memberikan konteks di luar matematika, sistem harus mengubahnya menjadi soal matematika yang tetap sesuai dengan tingkat SMA.  
      Bila diperlukan referensi gambar, soal harus dapat menyertakan gambar, seperti bangun ruang yang dimaksud atau elemen visual lainnya.

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
      "$$A = \\begin{bmatrix} 2 & 3 & 1 \ 4 & 0 & -1 \ 5 & 2 & 3 \end{bmatrix}$$"
      "$$\frac{1}{2} + \frac{1}{4} - \frac{1}{8}$$."
      "f(x) = $\frac{x^2 - 1}{x - 1}$ saat  (x)"
      "$$d = \\sqrt{25}$$"

      ---
      Warnings:
      - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
      - Jika pengguna memberikan topik di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi soal matematika yang tetap sesuai tingkat SMA.  
      - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
      - Jika konteks yang diberikan memerlukan gambar, cari gambar yang tersedia di internet yang dapat ditampilkan dengan benar. Hindari sumber seperti Wikipedia yang sering tidak menampilkan gambar. Pastikan gambar berasal dari sumber yang dapat diakses dan ditampilkan dengan baik.
      - **Jangan memberikan respons dalam bentuk teks biasa atau kosong**—semua output harus sesuai dengan format CSV yang telah ditentukan.  

      ---
      Context Dump:
      Saya ingin sistem ini beradaptasi dengan format input berikut:  
      "|-[perintah dan aturan]-| |-[tingkat kesulitan]-| |-[tipe soal]-|"

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
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kesulitan C1]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "<judul>|-><deskripsi>|-><jawaban>|-><topik>",
      },
      {
        role: "user",
        content: "|-[buat soal persamaan 3 variabel]-| |-[tingkat kesulitan C1]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Sistem Persamaan Linear Tiga Variabel|->Diberikan sistem persamaan linear dengan tiga variabel sebagai berikut:\n\n1. $x + 2y + 3z = 14$\n\n2. $2x - y + z = 6$\n\n3. $3x + 4y - 2z = 10$\n\nSelesaikan sistem persamaan di atas dan tentukan nilai dari masing-masing variabel: $x$, $y$, dan $z$.|->Langkah penyelesaian:\n\nMenggunakan metode eliminasi dan substitusi untuk sistem persamaan ini:\n\nPertama, kita eliminasi $x$ dari persamaan (1) dan (2) dengan mengalikan (1) dengan 2 dan mengurangkan persamaan (1) baru dari (2):\n\n$2x + 4y + 6z = 28$\n\n$2x - y + z = 6$\n\n--------------------------\n\n$5y + 5z = 22$ $\rightarrow$ (A)\n\nKemudian, eliminasi $x$ dari (1) dan (3) dengan mengalikan (1) dengan 3 dan mengurangkan persamaan (1) baru dari (3):\n\n$3x + 6y + 9z = 42$\n\n$3x + 4y - 2z = 10$\n\n--------------------------\n\n$2y + 11z = 32$ $\rightarrow$ (B)\n\nSekarang, kita memiliki:\n\n(A) $5y + 5z = 22$\n\n(B) $2y + 11z = 32$\n\nDari (A), kita dapatkan $y = 22/5 - z$ dan masukkan ke (B):\n\n$2(22/5 - z) + 11z = 32$\n$44/5 - 2z + 11z = 32$\n$9z = 32 - 44/5$\n$9z = 116/5 - 44/5$\n$9z = 72/5$\n$z = 8/5$\n\nMengganti nilai $z$ ke dalam persamaan (A):\n$5y + 5(8/5) = 22$\n$5y + 8 = 22$\n$5y = 14$\n$y = 14/5$\n\nSekarang mencari nilai $x$ menggantikan $y$ dan $z$ ke dalam (1):\n$x + 2(14/5) + 3(8/5) = 14$\n$x + 28/5 + 24/5 = 14$\n$x + 52/5 = 14$\n$x = 14 - 52/5$\n$x = 70/5 - 52/5$\n\n$x = 18/5$\n\nJadi, solusi dari sistem adalah $x = 18/5$, $y = 14/5$, $z = 8/5$.|->Aljabar",
      },
      {
        role: "user",
        content: "|-[8. Jelaskan konsep induksi matematika dan berikan contoh sederhana tentang bagaimana induksi digunakan untuk membuktikan pernyataan bahwa jumlah n bilangan ganjil pertama adalah n².]-| |-[tingkat kesulitan C1]-| |-[bertipe Esai]-|",
      },
      {
        role: "assistant",
        content: "Induksi Matematika dan Contoh|->Jelaskan konsep induksi matematika dan berikan contoh sederhana tentang bagaimana induksi digunakan untuk membuktikan pernyataan bahwa jumlah n bilangan ganjil pertama adalah n².|->Induksi Matematika adalah metode pembuktian yang digunakan untuk menunjukkan kebenaran suatu pernyataan untuk semua bilangan bulat positif.\n\nProses induksi terdiri dari dua langkah: basis dan langkah induksi. Basis adalah verifikasi bahwa pernyataan tersebut benar untuk bilangan bulat terkecil (biasanya $n = 1$).\n\nLangkah induksi menunjukkan bahwa jika pernyataan benar untuk $n = k$, maka itu juga benar untuk $n = k + 1$.\n\nBerikut adalah contoh penerapan induksi matematika untuk membuktikan bahwa jumlah $n$ bilangan ganjil pertama adalah $n^2$.\n\n**Pernyataan:** Jumlah $n$ bilangan ganjil pertama adalah $n^2$.\n\n**Basis:** Untuk $n = 1$, bilangan ganjil pertama adalah 1, dan $1^2 = 1$. Jadi, pernyataan benar untuk $n = 1$.\n\n**Langkah Induksi:** Asumsikan pernyataan benar untuk $n = k$, yaitu jumlah $k$ bilangan ganjil pertama adalah $k^2$. Tambahkan bilangan ganjil berikutnya, yaitu $2k + 1$, ke jumlah ini:\n\nJumlah untuk $k + 1$ bilangan ganjil pertama = $k^2 + (2k + 1)$.\n\nSederhanakan: $k^2 + 2k + 1 = (k + 1)^2$.\n\nIni membuktikan bahwa jika pernyataan benar untuk $n = k$, maka juga benar untuk $n = k + 1$.\n\nOleh karena itu, dengan prinsip induksi matematika, pernyataan tersebut benar untuk semua bilangan bulat positif $n$.|->Aljabar",
      },
      {
        role: "user",
        content: "|-[17. Tentukan nilai limit dari $f(x) = \frac{x^2 - 1}{x - 1}$ saat $x$ mendekati 1.]-| |-[tingkat kesulitan C3]-| |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: "Limit Fungsi|->Tentukan nilai limit dari $f(x) = \frac{x^2 - 1}{x - 1}$ saat $x$ mendekati 1. Pilihan jawaban:\n\\\nA. 0\n\\\nB. 1\n\\\nC. 2\n\\\nD. Tidak terdefinisi\n\\\n\E. 3|->Untuk menentukan limit tersebut, kita dapat menyederhanakan fungsi terlebih dahulu. Fungsi $f(x) = \frac{x^2 - 1}{x - 1}$ dapat difaktorkan sebagai berikut:\n\n$$f(x) = \frac{(x - 1)(x + 1)}{x - 1}$$\n\nDengan mengeliminasi faktor $(x - 1)$ yang sama di pembilang dan penyebut, kita mendapatkan:\n\n$$f(x) = x + 1$$\n\nSekarang kita dapat menghitung limitnya saat $x$ mendekati 1:\n\n$$\lim_{{x \to 1}} (x + 1) = 1 + 1 = 2$$\n\nJadi, nilai limit dari $f(x)$ saat $x$ mendekati 1 adalah 2. Jawaban yang benar adalah C. 2.|->Kalkulus",
      },
      {
        role: "user",
        content: "|-[tebak gambar bangun ruang]-| |-[tingkat kesulitan C6]-| |-[bertipe PG]-|",
      },
      {
        role: "assistant",
        content: "Tebak Gambar Bangun Ruang|->Pada gambar di bawah ini terdapat sebuah bangun ruang. Pilihlah nama bangun ruang yang tepat berdasarkan gambar tersebut.\n\n![image](https://files.oaiusercontent.com/file-KSjexG1QiCZhRLbfLRry6d?se=2025-03-08T17%3A47%3A51Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D615aa608-0231-4d2f-b21e-3a43b78b7f4f.webp&sig=oKJSUFyQxvw5fKYDN1MZLfCegQDIWp2t/OR691/p0ME%3D)\n\nPilihan jawaban:\n\\\nA. Kubus\n\\\nB. Balok\n\\\nC. Prisma Segitiga\n\\\nD. Limas Segiempat\n\\\nE. Tabung|->Misalkan gambar menunjukkan sebuah bangun ruang yang memiliki enam sisi yang semuanya berbentuk persegi dan sama besar. Berdasarkan karakteristik tersebut, bangun ruang ini adalah:\n\nJawaban yang benar adalah A. Balok.|->Geometri",
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-|`,
      },
    ];
  } else  {
    systemPrompt = `
    ---
    Goal:
    Saya ingin sebuah sistem yang dapat membuat daftar ide soal matematika tingkat Sekolah Menengah Atas (SMA) menggunakan kurikulum Indonesia terbaru. Ide soal harus jelas, sesuai kurikulum, dan menyesuaikan tingkat kesulitan berdasarkan tingkat kognitif Taksonomi Bloom C1-C6.  
    Soal harus tetap dalam konteks Indonesia, termasuk mata uang, budaya, atau aspek lain yang relevan. Jika pengguna memberikan konteks di luar matematika, sistem harus mengubahnya menjadi ide soal matematika yang tetap sesuai dengan tingkat SMA.  
    Bila diperlukan referensi gambar, soal harus dapat menyertakan gambar, seperti bangun ruang yang dimaksud atau elemen visual lainnya.
    
    ---
    Return Format:
    Hasil harus selalu dalam format **CSV dengan pemisah "|->"**, yang mencakup kolom:  
    - **prompt** → Menjelaskan ide soal yang akan dibuat, serta memberikan penjabaran lebih detail mengenai soal tersebut, seperti jenis soal.  
    - **tingkat kesulitan** → Tingkat kesulitan soal, yang HANYA bisa berupa tingkat koognitif Taksonomi Bloom C1 hingga C6.  
    - **jenis** → Jenis soal, yang HANYA bisa berupa "Esai" atau "PG" (Pilihan Ganda).  
    
    Contoh format:  
    "<prompt>|-><tingkat kesulitan>|-><jenis>"
    
    Jika ada rumus atau simbol matematika, gunakan format **LaTeX** atau yang mendukung **rehype-katex** dan **remark-math** agar tampilan lebih baik.  
    Contoh latex:  
    "$$A = \\begin{bmatrix} 2 & 3 & 1 \\\\ 4 & 0 & -1 \\\\ 5 & 2 & 3 \\end{bmatrix}$$"
    "$$\\frac{1}{2} + \\frac{1}{4} - \\frac{1}{8}$$."
    "f(x) = $\\frac{x^2 - 1}{x - 1}$ saat  (x)"
    "$$d = \\\\sqrt{25}$$"
    
    ---
    Warnings:
    - Jika pengguna memberikan konteks yang **mengubah pola pikir matematika secara tidak relevan**, jangan diikuti.  
    - Jika pengguna memberikan topik di luar matematika (misalnya sejarah), ubah konteks tersebut menjadi ide soal matematika yang tetap sesuai tingkat SMA.  
    - Jika konteks yang diberikan mengandung isu negatif, arahkan soal agar menjadi positif.  
    - Jika konteks yang diberikan memerlukan gambar, cari gambar yang tersedia di internet yang dapat ditampilkan dengan benar. Hindari sumber seperti Wikipedia yang sering tidak menampilkan gambar. Pastikan gambar berasal dari sumber yang dapat diakses dan ditampilkan dengan baik.
    - **Jangan memberikan respons dalam bentuk teks biasa atau kosong**—semua output harus sesuai dengan format CSV yang telah ditentukan.  
    
    ---
    Context Dump:
    Saya ingin sistem ini beradaptasi dengan format input berikut:  
    "|-[perintah dan aturan]-| |-[referensi pengetahuan dan aturan seperti kurikulum atau rencana pembelajaran yang perlu diuji]-| |-[tingkat kesulitan]-| |-[tipe soal]-| |-[jumlah soal]-|"
    
    Misalnya:  
    "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|"
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
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|",
      },
      {
        role: "assistant",
        content: "1. <prompt>|-><tingkat kesulitan>|-><jenis><_>2. <prompt>|-><tingkat kesulitan>|-><jenis><_>3. <prompt>|-><tingkat kesulitan>|-><jenis><_>4. <prompt>|-><tingkat kesulitan>|-><jenis><_>5. <prompt>|-><tingkat kesulitan>|-><jenis>",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-| |-[bertipe Acak]-| |-[jumlah 5 soal]-|",
      },
      {
        role: "assistant",
        content: "1. Soal Perbandingan (FPB): Soal ini melibatkan konsep FPB yang cukup dasar, tetapi perlu analisis untuk memahami bagaimana membagi jumlah apel dan jeruk secara maksimal.|->C2|->Esai<_>2. Soal Persamaan Linear (Kecepatan, Jarak, dan Waktu): Soal ini sederhana karena hanya membutuhkan rumus dasar kecepatan = jarak/waktu. Tidak banyak analisis yang diperlukan.|->C1|->Esai<_>3. Soal Pola Bilangan (Deret Aritmatika): Memerlukan pemahaman konsep deret aritmatika dan penerapan rumus jumlah suku. Tingkatannya menengah karena ada langkah tambahan untuk menghitung.|->C3|->PG<_>4. Soal Operasi Campuran (Aljabar Dasar): Menggunakan persamaan linier satu variabel yang sederhana. Penyelesaiannya langsung tanpa perlu banyak langkah kompleks.|->C1|->PG<_>5. Soal Pecahan (Operasi Pecahan): Menghitung pecahan dan mengurangkannya dari total hanya melibatkan operasi aritmatika dasar.|->C2|->Esai",
      },
      {
        role: "user",
        content: "|-[buat list soal matematika dasar]-| |-[tidak ada]-| |-[tingkat kesulitan Acak]-| |-[bertipe Acak]-| |-[jumlah 100 soal]-|",
      },
      {
        role: "assistant",
        content: "1. Menghitung hasil dari $$7 + 5 \\times 2$$. Tuliskan dengan urutan operasi yang benar (PEMDAS/BODMAS).|->C1|->PG<_>2. Sebuah mobil menempuh jarak 120 km dalam waktu 2 jam. Berapakah kecepatan rata-ratanya dalam km/jam?|->C2|->Esai<_>3. Tentukan nilai x jika $$3x + 5 = 20$$.|->C1|->PG<_>4. Jika sebuah keran mengisi air sebanyak 15 liter per menit, berapa liter air yang akan terisi dalam waktu 8 menit?|->C1|->Esai<_>5. Apa hasil dari 3/4 dikurangi 1/2? Ubah dalam bentuk desimal 2 tempat.|->C1|->PG<_>6. Gambarkan grafik fungsi linear $$y = 2x + 1$$ dan tentukan titik potong pada sumbu y.|->C4|->Esai<_>7. Diketahui luas persegi adalah 64 cm². Tentukan kelilingnya.|->C1|->PG<_>8. Hitunglah persentase dari 50 jika diketahui bahwa persentase dari 60 adalah 30%.|->C3|->Esai<_>9. Dalam sebuah kelas terdapat 40 siswa, 25 di antaranya menyukai matematika. Berapakah persentase siswa yang tidak menyukai matematika?|->C2|->PG<_>10. Jika harga sebuah buku Rp50.000 setelah diskon 20%, berapakah harga sebelum diskon?|->C4|->Esai<_>11. Temukan FPB dari bilangan 48 dan 60.|->C1|->PG<_>12. Andrea membeli 3 kg apel dan 2 kg jeruk. Jika harga apel Rp12.000/kg dan jeruk Rp10.000/kg, berapakah total biaya yang dikeluarkan Andrea?|->C3|->Esai<_>13. Konversikan suhu 100 derajat Celsius ke Fahrenheit.|->C2|->PG<_>14. Tentukan nilai dari $$\\frac{1}{2} + \\frac{1}{4} - \\frac{1}{8}$$.|->C3|->Esai<_>15. Sebuah persegi panjang memiliki panjang 10 cm dan lebar 5 cm. Tentukan luas dan kelilingnya.|->C2|->PG<_>16. Tentukan nilai maximum dari fungsi kuadrat $$y = -x^2 + 4x + 3$$.|->C5|->Esai<_>17. Seorang petani memiliki sejumlah telur yang akan dimasukkan ke dalam kotak-kotak. Setiap kotak menampung 12 telur. Jika terdapat 200 telur, berapa kotak yang dibutuhkan?|->C1|->PG<_>18. Hitung hasil dari $$\\\\sqrt{16} \\times 5 + 10$$.|->C2|->PG<_>19. Selesaikan sistem persamaan berikut: $$x + y = 10$$ dan $$x - y = 2$$.|->C3|->Esai<_>20. Sebuah tangki penuh mengandung 500 liter air. Jika air dikeluarkan dengan kecepatan 20 liter/menit, berapa menit yang dibutuhkan untuk mengosongkan tangki itu?|->C3|->PG<_>21. Dalam suatu undian terdapat 12 bola merah, 8 hijau, dan 5 biru. Jika satu bola diambil secara acak, berapakah peluang mendapatkan bola hijau?|->C4|->Esai<_>22. Tentukan nilai dari $$5^0$$ dan jelaskan alasannya.|->C2|->PG<_>23. If $$2x + 3 < 7$$, tentukan rentang nilai x.|->C4|->Esai<_>24. Apa beda antara median dan rata-rata dari sekumpulan data? Beri contoh sederhana.|->C2|->PG<_>25. Konversikan 2500 ml ke liter.|->C1|->Esai<_>26. Tentukan jumlah sudut dalam (interior) dari segitiga.|->C1|->PG<_>27. Seorang siswa mendapat nilai 70 pada tiga ujian pertama. Berapa nilai yang harus didapatkannya pada ujian keempat agar rata-ratanya menjadi 75?|->C5|->Esai<_>28. Jika panjang diagonal persegi adalah 10√2 cm, berapakah panjang sisi persegi tersebut?|->C3|->PG<_>29. Dalam perjalanan bersepeda, Ani bersepeda dengan kecepatan rata-rata 15 km/jam selama 3 jam. Berapakah jarak total yang ditempuh Ani?|->C1|->Esai<_>30. Sebuah saku baju mengandung 5 koin seribu, 3 koin lima ratus, dan 2 koin dua ratus. Berapakah total uang di dalam saku tersebut?|->C2|->PG<_>31. Sebuah pabrik memproduksi 150 unit barang setiap hari. Tentukan jumlah produksi selama sebulan (30 hari).|->C1|->Esai<_>32. Apa hasil dari $$\\frac{7}{9} \\times \\frac{2}{3}$$? Ubah ke bentuk desimal.|->C3|->PG<_>33. Tentukan volume balok dengan panjang 8 cm, lebar 5 cm, dan tinggi 2 cm.|->C2|->Esai<_>34. Hitung nilai rata-rata dari kumpulan data berikut: 4, 8, 10, 16, 18.|->C2|->PG<_>35. Dalam sebuah kelas, 60% siswa adalah laki-laki. Jika jumlah total siswa adalah 50, berapakah jumlah siswa perempuan?|->C2|->Esai<_>36. Sebuah perusahaan meminjam Rp2.000.000 dengan bunga 5% per tahun. Hitung total bunga setelah satu tahun.|->C2|->PG<_>37. Jika $$x = 3$$ dan $$y = 4$$, hitunglah nilai dari $$x^2 + y^2$$.|->C3|->Esai<_>38. Tentukan persamaan garis yang melalui titik (2, 3) dengan gradien (kemiringan) -1.|->C4|->PG<_>39. Dalam sebuah kantin, 40% dari 300 pengunjung memesan makanan cepat saji. Berapakah jumlah pengunjung yang memesan makanan lainnya?|->C2|->Esai<_>40. Sederhanakan ungkapan $$4x - 2(3x - 5)$$.|->C3|->PG<_>41. Hitunglah panjang sisi miring segitiga siku-siku yang alasnya 6 cm dan tingginya 8 cm.|->C3|->Esai<_>42. Berapakah sudut terkecil dalam segitiga sama kaki dengan satu sudut sebesar 40°?|->C4|->PG<_>43. Sebuah botol dapat menampung 1.5 liter air. Berapa banyak botol yang dibutuhkan untuk menampung 9 liter air?|->C1|->Esai<_>44. Jika luas lingkaran adalah 154 cm², carilah jari-jari lingkaran tersebut. (Gunakan $(\\pi = 3.14)$)|->C3|->PG<_>45. Tentukan hasil dari operasi matematika berikut: $$2 + 3 \\times (8 - 5)$$.|->C2|->Esai<_>46. Jika sebuah produk dijual dengan harga awal Rp75.000 dan mengalami penurunan harga menjadi Rp67.500, berapa persentase penurunan harga tersebut?|->C4|->PG<_>47. Seorang pejalan kaki melangkah 75 langkah per menit. Jika ia berjalan selama 20 menit, berapa langkah total yang telah dilakukannya?|->C1|->Esai<_>48. Jika segitiga sama sisi memiliki keliling 90 cm, tentukan panjang satu sisinya.|->C2|->PG<_>49. Tentukan operasi yang dilakukan jika Anda ingin menambahkan 25% dari sebuah nilai ke nilai tersebut.|->C3|->Esai<_>50. Sebuah limas segi empat dengan panjang alas 10 cm dan tinggi 15 cm memiliki luas alas sama dengan luas segitiga samping. Tentukan luas segitiga samping tersebut.|->C5|->PG<_>51. Jika $(f(x) = 2x + 7)$, tentukan $(f(3))$.|->C2|->Esai<_>52. Selesaikan persamaan berikut: $$\\frac{2x}{3} = 6$$.|->C3|->PG<_>53. Seorang siswa belajar selama 5 hari dalam seminggu. Jika setiap harinya belajar selama 2 jam, berapa total jam belajar selama satu minggu?|->C1|->PG<_>54. Dalam kurva distribusi normal, tentukan letak mean, median, dan modus.|->C4|->Esai<_>55. Tentukan titik tengah dari segmen garis dengan titik akhir (2, -3) dan (8, 5).|->C4|->PG<_>56. Tentukan hasil dari $$10!/\\left( 8! \\times 2! \\right)$$.|->C5|->Esai<_>57. Dalam pemetaan fungsi $(g(x) = x^2 - 5x + 6)$, tentukan nilai $(g(2))$.|->C3|->PG<_>58. Carilah bilangan yang didapatkan ketika menambahkan 250 ke 3/4 dari bilangan aslinya sehingga hasilnya menjadi 550.|->C6|->PG<_>59. Berapakah hasil dari $$\\log_2{8}$$?|->C2|->Esai<_>60. Tentukan hasil penjumlahan $(\\frac{1}{6} + \\frac{1}{3} + \\frac{1}{4})$ setelah diubah ke pecahan biasa.|->C3|->PG<_>61. Dalam ruang tiga dimensi, berapakah jumlah diagonal ruang yang dimiliki oleh balok?|->C2|->Esai<_>62. Dalam sebuah jam, apa sudut terkecil yang terbentuk antara jarum jam dan jarum menit ketika menunjukkan pukul 3.15?|->C4|->PG<_>63. Sederhanakan ekspresi $(5x - 3y + 2 - (4x - 2y + 5))$.|->C3|->Esai<_>64. Diketahui dua bilangan memiliki produk 48 dan salah satunya diketahui 6, berapakah bilangan lainnya?|->C1|->PG<_>65. Sebuah generator listrik menggunakan daya 30 kW dalam 5 jam. Berapakah energi yang dikonsumsi dalam kWh?|->C2|->Esai<_>66. Sebuah komet berada pada 0.5 satuan cahaya dari bumi. Jika kecepatannya konstan yaitu 0.1 satuan cahaya/tahun, dalam berapa tahun komet tersebut mencapai bumi?|->C4|->PG<_>67. Tentukan akar-akar dari persamaan kuadrat $(x^2 - 5x + 6 = 0)$.|->C3|->Esai<_>68. Sebuah balok memiliki volume 240 cm³, panjangnya 10 cm, dan lebar 4 cm. Tentukan tinggi balok tersebut.|->C2|->PG<_>69. Hitung panjang lintasan sebuah siklus penuh lingkaran dengan jari-jari 7 cm (gunakan $(\\pi = 22/7)$).|->C2|->Esai<_>70. Dalam arisan, terdapat 15 orang dan akan ditarik setiap bulan, berapa bulan diperlukan untuk setiap orang mendapat giliran undian?|->C1|->PG<_>71. Temukan dua angka yang jumlahnya 50 dan selisihnya 14.|->C4|->Esai<_>72. Tentukan nilai sin 30°, cos 60°, dan tan 45°.|->C1|->PG<_>73. Sebuah toko menjual baju dengan harga netto Rp250.000 setelah dikenakan pajak 10%. Berapakah harga sebelum pajak?|->C5|->Esai<_>74. Hitung luas dari titik pusat lingkaran di dalam ruang koordinat kartesian (0,0).|->C6|->PG<_>75. Konversikan 1200 detik menjadi menit dan detik.|->C1|->Esai<_>76. Temukan panjang sebenarnya jika pada peta 1 cm mewakili 5 km dan jarak pada peta adalah 15 cm.|->C2|->PG<_>77. Sebuah kue potongan memiliki luas bagian permukaan 154 cm². Jika ini berbentuk lingkaran, tentukan radius kue tersebut ($(\\pi = 3.14)$).|->C3|->Esai<_>78. Jika $(f(x) = 3x - 4)$ dan $(g(x) = x + 2)$, temukan $(f \\circ g)(x)$.|->C3|->PG<_>79. Jika $3^{x+2} = 9$, berapakah nilai x?|->C4|->Esai<_>80. Dalam komunitas sosial, 70% anggota setuju dengan kebijakan baru. Jika ada 200 anggota, berapa banyak yang tidak setuju?|->C2|->PG<_>81. Perguruan tinggi memiliki 500 kursi dan 40% dari kursi tersebut dialokasikan untuk beasiswa. Berapa banyak kursi yang dialokasikan?|->C2|->Esai<_>82. Jika $a + b = 10$ dan $a - b = 2$, tentukan nilai a dan b.|->C3|->PG<_>83. Tentukan volume dari sebuah tabung dengan jari-jari 7 cm dan tinggi 20 cm (gunakan $\\pi = 22/7$).|->C2|->PG<_>84. Carilah bilangan ganjil yang jika dibagi 5 memberikan sisa 3.|->C6|->Esai<_>85. Calculate the area of a trapezium with parallel sides of lengths 8 cm and 10 cm, and a height of 6 cm.|->C3|->PG<_>86. Jika 18 kotak krayon bisa mengisi habis 3 rak di rak pamer, berapa banyak kotak krayon yang diperlukan untuk mengisi 5 rak?|->C3|->Esai<_>87. Jika sebuah uang koin dilempar tiga kali, tentukan semua hasil kombinasi yang mungkin (misalnya, HHH, HHT, dll).|->C4|->PG<_>88. Carilah bilangan kelipatan dari 6 yang terletak antara 30 dan 60.|->C3|->Esai<_>89. Tentukan hasil dari operasi $$25 \\times 4 \\div 2 + 10 - 5$$ menggunakan prioritas operasi.|->C2|->PG<_>90. Ada 100 orang yang berpartisipasi dalam tes menulis, dan 75 dari mereka lulus. Berapakah nilai persentase kelulusan?|->C1|->Esai<_>91. Sebuah tiket konsert dijual seharga Rp250.000. Jika terdapat tambahan biaya administrasi 5%, berapakah total biaya yang harus dibayar?|->C5|->PG<_>92. Konversikan 8 meter menjadi sentimeter.|->C1|->PG<_>93. Jika persamaan lingkaran adalah $x^2 + y^2 = 25$, berapakah panjang diameter lingkaran tersebut?|->C3|->Esai<_>94. Temukan bilangan yang ketika dikalikandengan 8 hasilnya adalah 72.|->C1|->PG<_>95. Jika 3 pangkat x sama dengan 9, tentukan nilai x.|->C2|->Esai<_>96. Temukan rata-rata dari kumpulan data berikut: 70, 85, 65, 90, 75.|->C2|->PG<_>97. Dalam sebuah festival seni, jumlah peserta pria lebih banyak 20% daripada wanita, dan jumlah wanita ada 80 orang. Berapa jumlah total peserta pria?|->C3|->Esai<_>98. Sebuah buku memiliki 500 halaman, dan seorang siswa membaca 20 halaman sehari. Berapa hari yang diperlukan untuk menyelesaikan buku tersebut?|->C1|->PG<_>99. Jika kamu menabung Rp500 per hari, berapa banyak yang akan kamu miliki dalam 6 bulan (anggap sebulan terdiri dari 30 hari)?|->C2|->Esai<_>100. Jika persediaan beras akan cukup untuk 60 orang selama 3 minggu, berapa lama persediaan itu cukup untuk 90 orang jika tingkat konsumsi tetap?|->C4|->PG",
      },
      {
        role: "user",
        content: `|-[${prompt}]-| |-[${reference}]-| |-[tingkat kesulitan ${difficulty}]-| |-[bertipe ${type}]-| |-[jumlah ${total} soal]-|`,
      },
    ];
  }

  return messages;
}
