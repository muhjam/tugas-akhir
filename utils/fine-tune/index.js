export const fineTuneDetailId = [
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
];

export const fineTuneDetailEn = [
    {
        role: "user",
        content: "|-[create a problem involving a system of 3-variable equations]-| |-[Bloom’s Taxonomy cognitive level C1 (Remembering)]-| |-[Essay type]-|",
      },
      {
        role: "assistant",
        content: "<title>|-><description>|-><answer>|-><branch of science>",
      },
      {
        role: "user",
        content: "|-[create a problem involving a system of 3-variable equations]-| |-[Bloom’s Taxonomy cognitive level C1 (Remembering)]-| |-[Essay type]-|",
      },
      {
        role: "assistant",
        content: "System of Three-Variable Linear Equations|->Given the following system of linear equations with three variables:\n\n1. $x + 2y + 3z = 14$\n2. $2x - y + z = 6$\n3. $3x + 4y - 2z = 10$\n\nSolve the system above and determine the value of each variable: $x$, $y$, and $z$.|->Solution steps:\n\nUsing elimination and substitution methods for this system:\n\nFirst, eliminate $x$ from equations (1) and (2) by multiplying (1) by 2 and subtracting from (2):\n\n$2x + 4y + 6z = 28$\n\n$2x - y + z = 6$\n\n--------------------------\n\n$5y + 5z = 22$ → (A)\n\nNow eliminate $x$ from (1) and (3) by multiplying (1) by 3 and subtracting from (3):\n\n$3x + 6y + 9z = 42$\n\n$3x + 4y - 2z = 10$\n\n--------------------------\n\n$2y + 11z = 32$ → (B)\n\nNow we have:\n\n(A) $5y + 5z = 22$\n\n(B) $2y + 11z = 32$\n\nFrom (A), $y = 22/5 - z$, substitute into (B):\n\n$2(22/5 - z) + 11z = 32$\n$44/5 - 2z + 11z = 32$\n$9z = 32 - 44/5$\n$9z = 116/5 - 44/5$\n$9z = 72/5$\n$z = 8/5$\n\nSubstitute $z$ into (A):\n$5y + 5(8/5) = 22$\n$5y + 8 = 22$\n$5y = 14$\n$y = 14/5$\n\nSubstitute $y$ and $z$ into (1):\n$x + 2(14/5) + 3(8/5) = 14$\n$x + 28/5 + 24/5 = 14$\n$x + 52/5 = 14$\n$x = 14 - 52/5$\n$x = 70/5 - 52/5$\n\n$x = 18/5$\n\nTherefore, the solution to the system is $x = 18/5$, $y = 14/5$, $z = 8/5$.|->Algebra",
      },
      {
        role: "user",
        content: "|-[8. Explain the concept of mathematical induction and provide a simple example of how induction is used to prove that the sum of the first n odd numbers is n².]-| |-[Bloom’s Taxonomy cognitive level C1 (Remembering)]-| |-[Essay type]-|",
      },
      {
        role: "assistant",
        content: "Mathematical Induction and Example|->Explain the concept of mathematical induction and provide a simple example of how induction is used to prove that the sum of the first n odd numbers is n².|->Mathematical induction is a method of proof used to establish the truth of a statement for all positive integers.\n\nThe process consists of two steps: the base case and the inductive step. The base case verifies the statement for the smallest positive integer (usually $n = 1$).\n\nThe inductive step shows that if the statement is true for $n = k$, then it is also true for $n = k + 1$.\n\nHere's an example to prove that the sum of the first $n$ odd numbers is $n^2$ using induction:\n\n**Statement:** The sum of the first $n$ odd numbers is $n^2$.\n\n**Base Case:** For $n = 1$, the first odd number is 1, and $1^2 = 1$. So, the statement holds for $n = 1$.\n\n**Inductive Step:** Assume the statement holds for $n = k$, i.e., the sum of the first $k$ odd numbers is $k^2$. Add the next odd number, which is $2k + 1$:\n\nSum for $k + 1$ terms = $k^2 + (2k + 1)$\n\nSimplify: $k^2 + 2k + 1 = (k + 1)^2$\n\nThis proves that if the statement holds for $n = k$, it also holds for $n = k + 1$.\n\nTherefore, by the principle of mathematical induction, the statement is true for all positive integers $n$.|->Algebra",
      },
      {
        role: "user",
        content: "|-[17. Determine the limit value of $f(x) = \\frac{x^2 - 1}{x - 1}$ as $x$ approaches 1.]-| |-[Bloom’s Taxonomy cognitive level C3 (Applying)]-| |-[MCQ type]-|",
      },
      {
        role: "assistant",
        content: "Function Limit|->Determine the limit of $f(x) = \\frac{x^2 - 1}{x - 1}$ as $x$ approaches 1. The correct answer is...\n\nA. 0\nB. 1\nC. 2\nD. Undefined\nE. 3|->To evaluate the limit, we simplify the function first. The expression $f(x) = \\frac{x^2 - 1}{x - 1}$ can be factored:\n\n$$f(x) = \\frac{(x - 1)(x + 1)}{x - 1}$$\n\nBy canceling out the $(x - 1)$ term from numerator and denominator:\n\n$$f(x) = x + 1$$\n\nNow compute the limit as $x$ approaches 1:\n\n$$\lim_{{x \\to 1}} (x + 1) = 1 + 1 = 2$$\n\nHence, the correct answer is C. 2.|->Calculus",
      },
      {
        role: "user",
        content: "|-[guess the 3D shape from the drawing]-| |-[Bloom’s Taxonomy cognitive level C6 (Creating)]-| |-[MCQ type]-|",
      },
      {
        role: "assistant",
        content: `Guess the 3D Shape from the Drawing|->In the image below, identify the name of the 3D shape shown.\n\n<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">\n<line x1="100" y1="20" x2="30" y2="200" stroke="black" stroke-width="2"/>\n<line x1="100" y1="20" x2="170" y2="200" stroke="black" stroke-width="2"/>\n<path d="M30 200 Q100 230 170 200" stroke="black" fill="none" stroke-width="2"/>\n<path d="M170 200 Q100 170 30 200" stroke="black" fill="none" stroke-dasharray="6,4" stroke-width="2"/>\n</svg>\n\nWhat is the correct answer?\n\nA. Cube\n\nB. Rectangular Prism\n\nC. Cone\n\nD. Square Pyramid\n\nE. Cylinder|->The shape shown in the image is a **Cone**.\n\nKey characteristics of a cone:\n\n1. It has a circular base.\n2. It has a single vertex not on the base.\n3. Its curved surface connects the base to the vertex.\n4. Volume: $$V = \\frac{1}{3} \\pi r^2 h$$ where $r$ is radius and $h$ is height.\n5. Surface area: $$A = \\pi r (r + s)$$ where $s$ is the slant height.\n\nCones appear in everyday objects such as party hats and ice cream cones.\n\nThus, the correct answer is C. Cone.|->Geometry`,
      },
];


export const fineTuneListEn = [
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
    ]
        
    export const fineTuneListId = [
        {
          role: "user",
          content: "|-[create a list of basic math problems]-| |-[none]-| |-[Bloom’s Taxonomy cognitive level: Random]-| |-[question type: Random]-| |-[questions numbered from 1 to 5]-|",
        },
        {
          role: "assistant",
          content: "1. <prompt>|-><cognitive level>|-><question type><_>2. <prompt>|-><cognitive level>|-><question type><_>3. <prompt>|-><cognitive level>|-><question type><_>4. <prompt>|-><cognitive level>|-><question type><_>5. <prompt>|-><cognitive level>|-><question type>",
        },
        {
          role: "user",
          content: "|-[create a list of basic math problems]-| |-[none]-| |-[Bloom’s Taxonomy cognitive level: Random]-| |-[question type: Random]-| |-[questions numbered from 1 to 5]-|",
        },
        {
          role: "assistant",
          content: "1. Ratio Problem (GCF): This problem uses the concept of greatest common factor and requires analysis to determine the maximum way to divide apples and oranges.|->C2 (Understanding)|->Essay<_>2. Linear Equation (Speed, Distance, Time): A basic problem requiring only the formula speed = distance/time. Not much analysis needed.|->C1 (Remembering)|->Essay<_>3. Number Patterns (Arithmetic Sequence): Involves understanding arithmetic sequences and applying the formula for the sum. Mid-level in complexity.|->C3 (Applying)|->MCQ<_>4. Mixed Operations (Basic Algebra): Simple one-variable linear equation. Direct solution without complex steps.|->C1 (Remembering)|->MCQ<_>5. Fractions (Fraction Operations): Simple addition and subtraction involving fractions.|->C2 (Understanding)|->Essay",
        },
        {
          role: "user",
          content: "|-[create a list of basic math problems]-| |-[none]-| |-[Bloom’s Taxonomy cognitive level: Random]-| |-[question type: Random]-| |-[questions numbered from 6 to 6]-|",
        },
        {
          role: "assistant",
          content: "<_>6. Compute the result of $$7 + 5 \\times 2$$. Write your answer by following the correct order of operations (PEMDAS/BODMAS).|->C1 (Remembering)|->MCQ",
        },
      ];
      
    