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
  const systemPrompt = `
      You are a virtual assistant tasked with generating complex programming logic test cases. Your task is to respond with a validated JSON format containing the title, task description, and examples of the coding logic test. The coding logic test will be in Bahasa Indonesia. For each coding logic test, you must provide a minimum of 4 positive test cases and include two simple test cases along with the step-by-step solution for the related cases. Also, please note that for each coding logic test that you generate, please limit the data type to primitive types only (integer, boolean, string, and/or array). Please provide a clear and functional code example in TypeScript, including comments and meaningful variable names, and also include parameters, as these are used for testing the code we have. Make sure to use straightforward function names. In our test code, we are not able to use two-dimensional arrays, arrays of arrays, and arrays of objects, but other arrays are acceptable, and also, the function should not have more than one.

      RULES FOR YOU:
      - You can create coding logic tests or refer to https://ioinformatics.org/.
      - The instructions must be long and clear for the user to solve.
      - Do not provide random result examples like 'randomize the array contents' because in our program tests, we must check if the result is consistent.
      - You cannot create a function without parameters, such as 'totalEpisode()'. - You can change this to 'totalEpisode(seasons: array)' or 'totalEpisode(season1: number, season2: number)' or whatever you prefer and connect it to the context of the question.
      - If the output is a float, then it can only be rounded to a maximum of two decimal places. Make sure the generated code also handles rounding to two decimal digits.
      - Do not return null values.
      - Do not provide arrays of objects.
      - Do not use 'bebas' as a data type parameter.
      - Provide logic test references from large companies such as Google, Alibaba, etc., where these companies test new programs.
      - In the 'contoh kasus,' make it more explicit and detailed.
      - Provide **Contoh Kasus** that are longer than the examples I provided.

      After you generate test cases for each coding logic test, check the number of test cases you have generated. If the number is less than 4, automatically add additional test cases with relevant input and output values to ensure there are at least 4 test cases. Also, check that the test cases do not have any empty values. If there are empty values, please remove them and replace them with new test cases.

      For the primitive data types, please note the following:
      - For strings, enclose string values within double quotation marks.
      - For integers, simply provide the numeric value without any quotation marks.
      - For floats, simply provide the numeric value without any quotation marks, using '.' as the decimal separator.
      - For booleans, use the keywords 'true' or 'false' without any quotation marks.
      - For arrays, enclose the array values within square brackets, with each value separated by a comma.
      - For arrays, the values can only be primitive data types (integer, float, boolean, or string). For example: array of integers: [1, 2, 3, 4, 5], array of strings: ['apple', 'banana', 'cherry', 'durian', 'eggplant'], array of booleans: [true, false, true, false, true], array of floats: [3.14, 2.71, 1.41, 1.61, 1.73].
      - To ensure appropriate difficulty levels for the questions, categorization into easy, medium, and hard is crucial, based on the user's needs. If the user's preference is not specified, the default option is to randomize the difficulty level among these three categories.

      In addition, it's worth considering that the length of the question description and the length of function implementation also play a major role in determining the difficulty level. Typically, harder questions tend to have longer descriptions and longer function implementations, providing more complex requirements and requiring a greater level of comprehension and logic analysis to solve. This correlation between question difficulty, description length, and function implementation length can further aid in categorizing questions accurately.
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
            "logic test rumit, pemecahan kode",
        },
        {
          role: "assistant",
          content: `[\n    {\n        \"title\": \"Fibonacci Shift Cipher\",\n        \"description\": \"**Nama Soal**: Fibonacci Shift Cipher.\\n\\n**Deskripsi**: Challenge test ini akan menguji kemampuanmu dalam mengimplementasikan Shift Cipher menggunakan bilangan Fibonacci. Shift Cipher adalah salah satu metode enkripsi sederhana yang menggeser setiap huruf dalam sebuah teks sejauh n posisi ke kanan dalam alfabet. Dalam challenge ini, kamu akan menggunakan bilangan Fibonacci sebagai jumlah geseran untuk setiap huruf dalam teks.\\n\\n**Aturan**:\\n- Buatlah sebuah function dengan nama fibonacciCipher yang menerima sebuah parameter bertipe string **teks**\\n- input **teks** berupa alfabet kapital [A-Z] dan tidak mengandung karakter lain.\\n- Function harus mengembalikan teks yang telah dienkripsi menggunakan Shift Cipher dengan menggunakan bilangan Fibonacci sebagai jumlah geseran.\\n\\n**Contoh Kasus**:\\n- Kita ambil kasus dimana parameter input teks adalah 'HELLO'.\\n\\n Maka, Bilangan Fibonacci adalah : 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233.\\n1. H -> geser sebanyak 1 huruf = I\\n2. E -> geser sebanyak 1 huruf = F\\n3. L -> geser sebanyak 2 huruf = N\\n4. L -> geser sebanyak 3 huruf = O\\n5. O -> geser sebanyak 5 huruf = T\\n6. output = '**IFNOT**'\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"10 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"teks\",\n                \"typeData\": \"string\"\n            }\n        ],\n        \"expectedTypeData\": \"string\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"teks\": \"HELLO\"\n                },\n                \"expectedValue\": \"IFNOT\"\n            },\n            {\n                \"inputParameter\": {\n                    \"teks\": \"TESTING BAHASA\"\n                },\n                \"expectedValue\": \"UFUWNVT JDSORN\"\n            },\n            {\n                \"inputParameter\": {\n                    \"teks\": \"THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\"\n                },\n                \"expectedValue\": \"UIG VCVXS MFNJZ QYS JZRZH CIFF WZZ TVCW COF\"\n            },\n            {\n                \"inputParameter\": {\n                    \"teks\": \"LOREM IPSUM DOLOR SIT AMET\"\n                },\n                \"expectedValue\": \"MPTHR VKAXX CBXNC NNT FWTS\"\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function fibonacciCipher(teks: string): string {\\n\\t// replace the return value below with your answer\\n\\tlet shifted = \\\"\\\";\\n\\tconst shift: number[] = fibonacci(teks.length)\\n\\tfor (let i = 0; i < teks.length; i++) {\\n\\t\\tconst char = teks[i];\\n\\t\\tif (char >= 'A' && char <= 'Z') {\\n\\t\\t\\tshifted += String.fromCharCode(((char.charCodeAt(0) - 65 + shift[i] + 26) % 26) + 65);\\n\\t\\t}else{\\n\\t\\t\\tshifted += char\\n\\t\\t}\\n\\t  }\\n\\t\\n\\treturn shifted;\\n}\\n\\nfunction fibonacci(n: number): number[]{\\n\\tconst arr: number[] = []\\n\\tif (n >= 1) arr.push(1)\\n\\n\\tif (n>=2){\\n\\t\\tlet i = 0\\n\\t\\twhile (i < n - 1){\\n\\t\\t\\tlet x = arr[i]\\n\\t\\t\\tlet y = arr[i-1] || 0\\n\\t\\t\\tarr.push(x + y)\\n\\t\\t\\ti++\\n\\t\\t}\\n\\t}\\n\\treturn arr\\n}\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"fibonacciCipher\"\n        }\n    }\n]`,
    },{
          role: "user",
          content:
            "penjumlahan",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Naik Anak Tangga\",\n        \"description\": \"**Nama Soal**: Naik Anak Tangga.\\n\\n**Deskripsi**: Challenge ini aka menguji kemampuanmu untuk menemukan jumlah langkah minimal yang diperlukan untuk mencapai sebuah anak tangga tujuan. Kamu diberikan informasi tentang posisi anak tangga tujuan dan jarak maksimum yang dapat kamu lompati dalam satu langkah. Kamu hanya bisa menaiki anak tangga dengan melangkah satu per satu atau dengan melompat sejauh jarak maksimum yang diberikan. Kamu harus menghitung berapa jumlah langkah paling sedikit yang diperlukan untuk mencapai anak tangga yang menjadi target.\\n\\n**Aturan**:\\n- Buatlah sebuah function dengan nama jumlahLangkahMinimal yang akan menerima dua buah parameter: anakTanggaTujuan (integer) dan loncatan (integer).\\n- Function ini harus mengembalikan jumlah langkah minimal yang diperlukan untuk mencapai anak tangga tujuan.\\n\\n**Contoh Kasus**:\\n- Kita ambil kasus dimana parameter input anakTanggaTujuan bernilai 8 dan loncatan bernilai 3. Dalam kasus ini, hasil yang diperoleh adalah 4. Hasil ini diperoleh dengan cara sebagai berikut:\\n      \\n\\`\\`\\`\\n      Awal = 0\\n      Langkah pertama: 0 + 3 = 3 (Ambil loncatan)\\n      Langkah kedua: 3 + 3 = 6 (Ambil loncatan)\\n      Langkah ketiga: 6 + 1 = 7 (Loncatan akan menyebabkan ia melewati anak tangga yang dia inginkan. Oleh karena itu dia naik 1 saja)\\n      Langkah keempat: 7 + 1 = 8 (Loncatan akan menyebabkan ia melewati anak tangga yang dia inginkan. Oleh karena itu dia naik 1 saja)\\n      Total langkah yang diperlukan adalah 4\\n\\`\\`\\`\\n\\n- Kita ambil kasus dimana parameter input anakTanggaTujuan bernilai 15 dan loncatan bernilai 4. Dalam kasus ini, hasil yang diperoleh adalah 6. Hasil ini diperoleh dengan cara berikut:\\n      \\n\\`\\`\\`\\n      Awal = 0\\n      Langkah pertama: 0 + 4 = 4 (Ambil loncatan)\\n      Langkah kedua: 4 + 4 = 8 (Ambil loncatan)\\n      Langkah ketiga: 8 + 4 = 12 (Ambil loncatan)\\n      Langkah keempat: 12 + 1 = 13 (Loncatan akan menyebabkan ia melewati anak tangga yang dia inginkan. Oleh karena itu dia naik 1 saja)\\n      Langkah kelima: 13 + 1 = 14 (Loncatan akan menyebabkan ia melewati anak tangga yang dia inginkan. Oleh karena itu dia naik 1 saja)\\n      Langkah keenam: 14 + 1 = 15 (Loncatan akan menyebabkan ia melewati anak tangga yang dia inginkan. Oleh karena itu dia naik 1 saja)\\n      Total langkah yang diperlukan adalah 6\n\\`\\`\\`\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"10 minutes\",\n        \"hashtags\": \"programming, elementary grade, algorithm, mathematics\",\n        \"inputParameter\": [\n            {\n                \"name\": \"anakTanggaTujuan\",\n                \"typeData\": \"integer\"\n            },\n            {\n                \"name\": \"loncatan\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"anakTanggaTujuan\": 8,\n                    \"loncatan\": 3\n                },\n                \"expectedValue\": 4\n            },\n            {\n                \"inputParameter\": {\n                    \"anakTanggaTujuan\": 15,\n                    \"loncatan\": 4\n                },\n                \"expectedValue\": 6\n            },\n            {\n                \"inputParameter\": {\n                    \"anakTanggaTujuan\": 4,\n                    \"loncatan\": 2\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                    \"anakTanggaTujuan\": 3,\n                    \"loncatan\": 4\n                },\n                \"expectedValue\": 3\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function jumlahLangkahMinimal(anakTanggaTujuan, loncatan) {\\n    if (anakTanggaTujuan%loncatan == 0) {\\n        return anakTanggaTujuan/loncatan\\n    } else {\\n        return (Math.floor ((anakTanggaTujuan/loncatan) + (anakTanggaTujuan%loncatan)) )\\n    }\\n}\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"jumlahLangkahMinimal\"\n        }\n    }\n]",
    },
    {
          role: "user",
          content:
            "penjumlahan",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Penjumlahan biner\",\n        \"description\": \"**Nama Soal**: Penjumlahan Bilangan Biner.\\n\\n**Deskripsi**: Tugas ini menguji kemampuan Anda dalam operasi penjumlahan dua bilangan biner. Diberikan dua bilangan biner dalam bentuk string, Anda diminta untuk menjumlahkan kedua bilangan tersebut dan mengembalikan hasil penjumlahannya dalam bentuk string juga.\\n\\n**Aturan**:\\n1. Buatlah fungsi `binaryAddition` yang menerima dua parameter bertipe string. Parameter ini akan berisi bilangan biner dalam bentuk string.\\n\\n2. Pastikan input bilangan biner hanya terdiri dari digit 0 dan 1. Tidak ada karakter lain yang diperbolehkan.\\n\\n3. Lakukan penjumlahan bilangan biner dengan mempertimbangkan aturan biner. Anda akan menjumlahkan dari kanan ke kiri, seperti operasi penjumlahan biasa. Jika hasil penjumlahan lebih dari 1, simpan sisa hasil sebagai digit di posisi saat ini dan bawa ke depan 1 sebagai carry (seperti pada penjumlahan dalam sistem desimal).\\n\\n4. Setelah selesai melakukan penjumlahan, pastikan untuk mengecek carry. Jika masih ada carry, tambahkan 1 digit lagi ke hasil.\\n\\n5. Kembalikan hasil penjumlahan dalam bentuk string.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan dua bilangan biner: '1010' dan '1101'.\\n- Lakukan penjumlahan bilangan biner, 1010 + 1101 = 10111.\\n- Kembalikan '10111' sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan dua bilangan biner: '11' dan '1'.\\n- Lakukan penjumlahan bilangan biner, 11 + 1 = 100.\\n- Kembalikan '100' sebagai hasil.\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"10 minutes\",\n        \"hashtags\": \"Binary, String Manipulation, Logic\",\n        \"inputParameter\": [\n            {\n                \"name\": \"bilangan1\",\n                \"typeData\": \"string\"\n            },\n            {\n                \"name\": \"bilangan2\",\n                \"typeData\": \"string\"\n            }\n        ],\n        \"expectedTypeData\": \"string\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": \"1010\",\n                    \"bilangan2\": \"1101\"\n                },\n                \"expectedValue\": \"10111\"\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": \"11\",\n                    \"bilangan2\": \"1\"\n                },\n                \"expectedValue\": \"100\"\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": \"101\",\n                    \"bilangan2\": \"11\"\n                },\n                \"expectedValue\": \"1000\"\n            },\n            {\n                \"inputParameter\": {\n                    \"bilangan1\": \"111\",\n                    \"bilangan2\": \"111\"\n                },\n                \"expectedValue\": \"1110\"\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function binaryAddition(bilangan1: string, bilangan2: string): string {\\n    const decimal1 = parseInt(bilangan1, 2);\\n    const decimal2 = parseInt(bilangan2, 2);\\n    const sum = decimal1 + decimal2;\\n    const binarySum = sum.toString(2);\\n    return binarySum;\\n}\",\n            \"language\": \"Typescript\",\n            \"functionName\": \"binaryAddition\"\n        }\n    }\n]",
    },
     {
          role: "user",
          content:
            "logic test rumit google",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Word Ladder\",\n        \"description\": \"**Nama Soal**: Jarak Ladder Kata (Word Ladder)\\n\\n**Deskripsi**: Dalam teori graf, jarak ladder antara dua kata adalah jumlah minimum operasi yang diperlukan untuk mengubah satu kata menjadi kata lainnya. Setiap operasi hanya memungkinkan penggantian satu karakter dalam kata tersebut. Tugas Anda adalah mengimplementasikan fungsi untuk menemukan jarak ladder antara dua kata yang ada dalam kamus. Kamus diberikan dalam bentuk array string, dan Anda harus mengembalikan jumlah minimum operasi yang diperlukan.\\n\\nMari jelaskan beberapa konsep yang akan digunakan:\\n\\n- **Jarak Ladder**: Jarak ladder adalah sejumlah minimum operasi (misalnya, mengganti satu karakter) yang diperlukan untuk mengubah satu kata menjadi kata lain. Dalam hal ini, kita mencari jarak ladder antara kataAwal dan kataAkhir.\\n\\n- **Kamus**: Kamus adalah kumpulan kata-kata yang valid yang dapat digunakan dalam proses perubahan kata. Kamus diberikan sebagai array string yang merupakan daftar kata-kata yang valid.\\n\\nAnda perlu membuat fungsi `wordLadder` yang akan menerima tiga parameter: `kataAwal`, `kataAkhir`, dan `kamus`. Fungsi ini akan mengembalikan jumlah minimum operasi yang diperlukan untuk mengubah `kataAwal` menjadi `kataAkhir`.\\n\\n**Aturan**:\\n- Buatlah sebuah fungsi dengan nama `wordLadder` yang menerima tiga parameter bertipe string: `kataAwal`, `kataAkhir`, dan `kamus`.\\n- Function harus mengembalikan jumlah minimum operasi yang diperlukan untuk mengubah `kataAwal` menjadi `kataAkhir`.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan `kataAwal` 'hit', `kataAkhir` 'cog', dan `kamus` adalah ['hot', 'dot', 'dog', 'lot', 'log', 'cog'].\\n- Salah satu jalur minimum dengan jarak ladder 5 adalah 'hit' -> 'hot' -> 'dot' -> 'dog' -> 'cog'.\\n- Maka, kembalikan 5 sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan `kataAwal` 'hot', `kataAkhir` 'dog', dan `kamus` adalah ['hot', 'dog'].\\n- KataAwal sama dengan kataAkhir, tidak ada operasi yang diperlukan.\\n- Maka, kembalikan 0 sebagai hasil.\\n\\nInstruksi ini memberikan pemahaman tentang konsep 'jarak ladder kata' dan menguraikan bagaimana menerapkannya dalam fungsi `wordLadder`, termasuk parameter yang diperlukan dan contoh kasus yang menjelaskan pemecahan masalah.\",\n        \"difficultyLevel\": 5,\n        \"timeEstimationToFinish\": \"20 minutes\",\n        \"hashtags\": \"Graph, BFS, Algorithm\",\n        \"inputParameter\": [\n            {\n                \"name\": \"kataAwal\",\n                \"typeData\": \"string\"\n            },\n            {\n                \"name\": \"kataAkhir\",\n                \"typeData\": \"string\"\n            },\n            {\n                \"name\": \"kamus\",\n                \"typeData\": \"array\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"kataAwal\": \"hit\",\n                    \"kataAkhir\": \"cog\",\n                    \"kamus\": [\n                        \"hot\",\n                        \"dot\",\n                        \"dog\",\n                        \"lot\",\n                        \"log\",\n                        \"cog\"\n                    ]\n                },\n                \"expectedValue\": 5\n            },\n            {\n                \"inputParameter\": {\n                    \"kataAwal\": \"hot\",\n                    \"kataAkhir\": \"dog\",\n                    \"kamus\": [\n                        \"hot\",\n                        \"dog\"\n                    ]\n                },\n                \"expectedValue\": 0\n            },\n            {\n                \"inputParameter\": {\n                    \"kataAwal\": \"game\",\n                    \"kataAkhir\": \"code\",\n                    \"kamus\": [\n                        \"game\",\n                        \"code\",\n                        \"cade\",\n                        \"cade\",\n                        \"cade\",\n                        \"cade\"\n                    ]\n                },\n                \"expectedValue\": 3\n            },\n            {\n                \"inputParameter\": {\n                    \"kataAwal\": \"lead\",\n                    \"kataAkhir\": \"gold\",\n                    \"kamus\": [\n                        \"wind\",\n                        \"lead\",\n                        \"load\",\n                        \"laud\",\n                        \"goad\",\n                        \"gold\"\n                    ]\n                },\n                \"expectedValue\": 4\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function wordLadder(kataAwal, kataAkhir, kamus) {\\n    // Implement your solution here\\n}\",\n            \"language\": \"Javascript\",\n            \"functionName\": \"wordLadder\"\n        }\n    }\n]",
    },
    {
          role: "user",
          content:
            "logic test rumit google",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Longest Palindromic Substring\",\n        \"description\": \"**Nama Soal**: Mencari Substring Palindrom Terpanjang\\n\\n**Deskripsi**: Diberikan sebuah string, Anda diminta untuk menemukan substring palindrom terpanjang dalam string tersebut. Substring palindrom adalah substring yang dapat dibaca sama dari depan maupun belakang.\\n\\n**Aturan**:\\n1. Buatlah sebuah fungsi dengan nama `longestPalindromicSubstring` yang menerima satu parameter bertipe string.\\n\\n2. Anda perlu mencari dan mengidentifikasi substring palindrom dalam string. Ini dapat dilakukan dengan mengiterasi melalui setiap karakter dalam string dan memeriksa semua kemungkinan substring yang mungkin.\\n\\n3. Temukan substring palindrom terpanjang yang memenuhi syarat.\\n\\n4. Kembalikan substring palindrom terpanjang sebagai hasil.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan string 'babad'.\\n- Substring palindrom terpanjang dalam string tersebut adalah 'bab', karena dapat dibaca sama dari depan maupun belakang.\\n- Maka, kembalikan 'bab' sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan string 'cbbd'.\\n- Substring palindrom terpanjang dalam string tersebut adalah 'bb', karena dapat dibaca sama dari depan maupun belakang.\\n- Maka, kembalikan 'bb' sebagai hasil.\",\n        \"difficultyLevel\": 4,\n        \"timeEstimationToFinish\": \"15 minutes\",\n        \"hashtags\": \"String Manipulation, Dynamic Programming, Algorithm\",\n        \"inputParameter\": [\n            {\n                \"name\": \"string\",\n                \"typeData\": \"string\"\n            }\n        ],\n        \"expectedTypeData\": \"string\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"string\": \"babad\"\n                },\n                \"expectedValue\": \"bab\"\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"cbbd\"\n                },\n                \"expectedValue\": \"bb\"\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"racecar\"\n                },\n                \"expectedValue\": \"racecar\"\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"abcdabcd\"\n                },\n                \"expectedValue\": \"cdc\"\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function longestPalindromicSubstring(string) {\\n    let longest = '';\\n\\n    const expandAroundCenter = (left, right) => {\\n        while (left >= 0 && right < string.length && string[left] === string[right]) {\\n            left--;\\n            right++;\\n        }\\n\\n        const currentPalindrome = string.slice(left + 1, right);\\n        if (currentPalindrome.length > longest.length) {\\n            longest = currentPalindrome;\\n        }\\n    }\\n\\n    for (let i = 0; i < string.length; i++) {\\n        expandAroundCenter(i, i); // For odd length palindrome\\n        expandAroundCenter(i, i + 1); // For even length palindrome\\n    }\\n\\n    return longest;\\n}\",\n            \"language\": \"Javascript\",\n            \"functionName\": \"longestPalindromicSubstring\"\n        }\n    }\n]",
    },
    {
          role: "user",
          content:
            "logic test rumit google",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"GCD and LCM\",\n        \"description\": \"**Nama Soal**: Menghitung GCD dan LCM (Greatest Common Divisor dan Least Common Multiple).\\n\\n**Deskripsi**: Dalam matematika, GCD (Greatest Common Divisor) adalah bilangan bulat positif terbesar yang membagi habis dua atau lebih bilangan, sedangkan LCM (Least Common Multiple) adalah kelipatan terkecil dari dua atau lebih bilangan. Untuk menyelesaikan masalah ini, Anda diminta untuk mengimplementasikan sebuah fungsi yang dapat menghitung GCD dan LCM dari dua bilangan yang diberikan.\\n\\n**Aturan**:\\n- Buatlah sebuah fungsi dengan nama `gcdLcm` yang menerima dua parameter bertipe integer.\\n- Fungsi ini harus mengembalikan array dengan dua elemen, yaitu GCD dan LCM dari dua bilangan tersebut.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan dua bilangan, 12 dan 18.\\n- GCD dari 12 dan 18 adalah 6.\\n- LCM dari 12 dan 18 adalah 36.\\n- Maka, kembalikan array [6, 36] sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan dua bilangan, 8 dan 15.\\n- GCD dari 8 dan 15 adalah 1.\\n- LCM dari 8 dan 15 adalah 120.\\n- Maka, kembalikan array [1, 120] sebagai hasil.\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"10 minutes\",\n        \"hashtags\": \"Mathematics, GCD, LCM\",\n        \"inputParameter\": [\n            {\n                \"name\": \"num1\",\n                \"typeData\": \"integer\"\n            },\n            {\n                \"name\": \"num2\",\n                \"typeData\": \"integer\"\n            }\n        ],\n        \"expectedTypeData\": \"array\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"num1\": 12,\n                    \"num2\": 18\n                },\n                \"expectedValue\": [\n                    6,\n                    36\n                ]\n            },\n            {\n                \"inputParameter\": {\n                    \"num1\": 8,\n                    \"num2\": 15\n                },\n                \"expectedValue\": [\n                    1,\n                    120\n                ]\n            },\n            {\n                \"inputParameter\": {\n                    \"num1\": 24,\n                    \"num2\": 36\n                },\n                \"expectedValue\": [\n                    12,\n                    72\n                ]\n            },\n            {\n                \"inputParameter\": {\n                    \"num1\": 7,\n                    \"num2\": 9\n                },\n                \"expectedValue\": [\n                    1,\n                    63\n                ]\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function gcdLcm(num1, num2) {\\n    const gcd = calculateGCD(num1, num2);\\n    const lcm = (num1 * num2) / gcd;\\n    return [gcd, lcm];\\n}\\n\\nfunction calculateGCD(a, b) {\\n    if (b === 0) {\\n        return a;\\n    }\\n\\n    return calculateGCD(b, a % b);\\n}\",\n            \"language\": \"Javascript\",\n            \"functionName\": \"gcdLcm\"\n        }\n    }\n]",
    },
     {
          role: "user",
          content:
            "logic test rumit google",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Valid Parentheses\",\n        \"description\": \"**Nama Soal**: Valid Parentheses\\n\\n**Deskripsi**: Dalam string terdapat tiga jenis karakter pembuka dan penutup: kurung buka '(' dan tutup ')', kurung siku buka '[' dan tutup ']', kurung kurawal buka '{' dan tutup '}'. Anda diminta untuk membuat sebuah fungsi yang akan mengecek apakah pasangan karakter pembuka dan penutup dalam string diberikan berurutan dengan benar dan valid.\\n\\n**Aturan**:\\n- Buatlah sebuah fungsi dengan nama `validParentheses` yang menerima satu parameter bertipe string.\\n- Fungsi ini harus mengembalikan nilai boolean, yaitu `true` jika pasangan karakter pembuka dan penutup dalam string diberikan berurutan dengan benar dan valid, dan `false` jika tidak.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan string '()'.\\n- Pasangan kurung buka '(' dan tutup ')' berada dalam urutan yang benar.\\n- Maka, kembalikan `true` sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan string '()[]{([])}'.\\n- Pasangan kurung buka dan tutup dalam string berada dalam urutan yang benar.\\n- Maka, kembalikan `true` sebagai hasil.\\n\\nContoh 3:\\n- Anda diberikan string '({])'.\\n- Terdapat pasangan kurung buka '{' dan kurung tutup '}', tetapi pasangan kurung siku ']' tidak berada dalam urutan yang benar.\\n- Maka, kembalikan `false` sebagai hasil.\",\n        \"difficultyLevel\": 3,\n        \"timeEstimationToFinish\": \"10 minutes\",\n        \"hashtags\": \"String Manipulation, Stack, Algorithm\",\n        \"inputParameter\": [\n            {\n                \"name\": \"string\",\n                \"typeData\": \"string\"\n            }\n        ],\n        \"expectedTypeData\": \"boolean\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"string\": \"()\"\n                },\n                \"expectedValue\": true\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"()[]{}\"\n                },\n                \"expectedValue\": true\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"({[)]}\"\n                },\n                \"expectedValue\": false\n            },\n            {\n                \"inputParameter\": {\n                    \"string\": \"{[]()}\"\n                },\n                \"expectedValue\": true\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function validParentheses(string) {\\n    const stack = [];\\n\\n    for (let i = 0; i < string.length; i++) {\\n        const char = string[i];\\n\\n        if (char === '(' || char === '[' || char === '{') {\\n            stack.push(char);\\n        } else {\\n            if (stack.length === 0) {\\n                return false;\\n            }\\n\\n            const top = stack[stack.length - 1];\\n\\n            if (char === ')' && top === '(') {\\n                stack.pop();\\n            } else if (char === ']' && top === '[') {\\n                stack.pop();\\n            } else if (char === '}' && top === '{') {\\n                stack.pop();\\n            } else {\\n                return false;\\n            }\\n        }\\n    }\\n\\n    return stack.length === 0;\\n}\",\n            \"language\": \"Javascript\",\n            \"functionName\": \"validParentheses\"\n        }\n    }\n]",
    },
     {
          role: "user",
          content:
            "logic test rumit google",
        },
        {
          role: "assistant",
          content: "[\n    {\n        \"title\": \"Largest Subarray with Equal Number of 0s and 1s\",\n        \"description\": \"**Judul**: Menemukan Subarray Terbesar dengan Jumlah 0 dan 1 yang Sama\\n\\n**Deskripsi**:\\n\\nAnda diberikan sebuah array yang hanya berisi angka 0 dan 1. Tugas Anda adalah menemukan subarray terbesar di dalamnya yang memiliki jumlah 0 dan 1 yang sama. Dalam konteks ini, subarray adalah sekelompok elemen yang berdekatan dalam array. Anda perlu mengimplementasikan fungsi untuk menemukan panjang subarray terbesar yang memenuhi kriteria ini.\\n\\nUntuk lebih memahami masalah ini, mari kita bahas beberapa konsep:\\n\\n- **Subarray**: Subarray adalah bagian dari array yang terdiri dari elemen-elemen yang berdekatan dalam urutan yang sama seperti dalam array asli. Misalnya, dalam array `[0, 1, 0, 1]`, subarray `[0, 1]` adalah subarray yang berdekatan.\\n\\n- **Panjang Subarray**: Panjang subarray adalah jumlah elemen dalam subarray. Dalam kasus ini, Anda ingin menemukan subarray terbesar, yang berarti subarray dengan jumlah elemen terbanyak.\\n\\n- **Subarray dengan Jumlah 0 dan 1 yang Sama**: Anda ingin mencari subarray yang memiliki jumlah angka 0 dan 1 yang sama. Misalnya, subarray `[0, 1, 0, 1, 0]` memiliki jumlah 0 dan 1 yang sama (3 angka 0 dan 3 angka 1).\\n\\nUntuk menyelesaikan tugas ini, Anda perlu membuat sebuah fungsi yang disebut `largestSubarray`. Fungsi ini akan menerima satu parameter, yaitu array berisi angka-angka 0 dan 1, dan akan mengembalikan panjang dari subarray terbesar yang memenuhi kriteria jumlah 0 dan 1 yang sama.\\n\\n**Aturan**:\\n\\n1. Buatlah sebuah fungsi dengan nama `largestSubarray` yang menerima satu parameter berupa array of integers.\\n\\n2. Anda perlu mencari subarray yang memenuhi kriteria jumlah 0 dan 1 yang sama. Untuk melakukannya, Anda dapat menggunakan pendekatan iteratif, yaitu dengan menghitung jumlah 0 dan 1 dalam subarray yang berkembang saat Anda melintasi array.\\n\\n3. Simpan panjang subarray terbesar yang memenuhi kriteria seiring dengan iterasi.\\n\\n4. Kembalikan panjang subarray terbesar sebagai hasil. Jika tidak ada subarray yang memenuhi kriteria, kembalikan nilai 0.\\n\\n**Contoh Kasus**:\\n\\nContoh 1:\\n- Anda diberikan array `[0, 1, 0]`.\\n- Subarray terbesar dengan jumlah 0 dan 1 yang sama adalah `[0, 1]`, dengan panjang 2.\\n- Maka, kembalikan nilai 2 sebagai hasil.\\n\\nContoh 2:\\n- Anda diberikan array `[1, 1, 1, 0, 1, 1, 0, 0, 0, 1]`.\\n- Subarray terbesar dengan jumlah 0 dan 1 yang sama adalah `[1, 1, 0, 1, 1, 0]`, dengan panjang 6.\\n- Maka, kembalikan nilai 6 sebagai hasil.\",\n        \"difficultyLevel\": 4,\n        \"timeEstimationToFinish\": \"15 minutes\",\n        \"hashtags\": \"Array, Prefix Sum, Sliding Window, Algorithm\",\n        \"inputParameter\": [\n            {\n                \"name\": \"arr\",\n                \"typeData\": \"array\"\n            }\n        ],\n        \"expectedTypeData\": \"integer\",\n        \"testCase\": [\n            {\n                \"inputParameter\": {\n                    \"arr\": [\n                        0,\n                        1,\n                        0\n                    ]\n                },\n                \"expectedValue\": 2\n            },\n            {\n                \"inputParameter\": {\n                    \"arr\": [\n                        1,\n                        1,\n                        1,\n                        0,\n                        1,\n                        1,\n                        0,\n                        0,\n                        0,\n                        1\n                    ]\n                },\n                \"expectedValue\": 6\n            },\n            {\n                \"inputParameter\": {\n                    \"arr\": [\n                        0,\n                        0,\n                        0,\n                        0,\n                        0,\n                        0\n                    ]\n                },\n                \"expectedValue\": 0\n            },\n            {\n                \"inputParameter\": {\n                    \"arr\": [\n                        1,\n                        1,\n                        1,\n                        1,\n                        1\n                    ]\n                },\n                \"expectedValue\": 0\n            }\n        ],\n        \"implementation\": {\n            \"function\": \"function largestSubarray(arr) {\\n    const hashMap = new Map();\\n    hashMap.set(0, -1);\\n    let maxLen = 0;\\n    let count = 0;\\n\\n    for (let i = 0; i < arr.length; i++) {\\n        count += arr[i] === 0 ? -1 : 1;\\n\\n        if (hashMap.has(count)) {\\n            maxLen = Math.max(maxLen, i - hashMap.get(count));\\n        } else {\\n            hashMap.set(count, i);\\n        }\\n    }\\n\\n    return maxLen;\\n}\",\n            \"language\": \"Javascript\",\n            \"functionName\": \"largestSubarray\"\n        }\n    }\n]",
    },
      {
        role: "user",
        content: prompt,
      },
  ];

  return messages;
}
