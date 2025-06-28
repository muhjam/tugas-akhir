
import {fineTuneDetailId, fineTuneDetailEn, fineTuneListId, fineTuneListEn} from "../../utils/fine-tune";
import { systemPromptDetailId, systemPromptDetailEn, systemPromptListId, systemPromptListEn } from "../../utils/system-prompt";

require('dotenv').config();
const { AzureKeyCredential } = require('@azure/openai')
const { default: ModelClient } = require("@azure-rest/ai-inference")

const key = process.env.AZURE_KEY_GPT4
const endpoint = process.env.AZURE_ENDPOINT_GPT4
const path = process.env.AZURE_COMPLETIONPATH_GPT4

const client = new ModelClient(endpoint, new AzureKeyCredential(key));

export default async function (req, res) {
  const { prompt, mode, difficulty, reference, type, total, lang } = req.body || {};

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
        total,
        lang
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

      const chunkBody = {
        prompt,
        mode,
        difficulty,
        reference,
        type,
        total: currentChunkSize,
        range: { start: startIndex, end: endIndex },
        lang
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
  const difficulty = data?.difficulty || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";
  const range = data?.range || { start: 1, end: total };
  const mode = data?.mode || "list";
  const lang = data?.lang || "id";

  let messages;

  if(mode === "detail"){
      messages = [
        {
          role: "system",
          content: lang === "id" ? systemPromptDetailId : systemPromptDetailEn,
        }
      ];

      if (lang === "id") {
        messages = [...messages, ...fineTuneDetailId];
      } else {
        messages = [...messages, ...fineTuneDetailEn];
      }

      messages.push({
        role: "user",
        content: `|-[${prompt}]-| |-[tingkat kognitif Taksonomi Bloom ${difficulty}]-| |-[bertipe ${type}]-|`,
      });
 
  } else  {
    
    messages = [
      {
        role: "system",
        content: lang === "id" ? systemPromptListId : systemPromptListEn,
      },
    ];
      
      if (lang === "id") {
        messages = [...messages, ...fineTuneListId];
      } else {
        messages = [...messages, ...fineTuneListEn];
      }

      messages.push({
        role: "user",
        content: `|-[${prompt}]-| |-[${reference}]-| |-[tingkat kognitif Taksonomi Bloom ${difficulty}]-| |-[bertipe ${type}]-| |-[soal mulai dari nomor ${range.start} sampai nomor ${range.end}]-|`,
      });
  }

  return messages;
}
