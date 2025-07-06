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
  const { prompt, mode, difficulty, reference, type, total, lang, stream } = req.body || {};

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({
      error: { message: "Please enter a valid text" }
    });
  }

  const totalQuestions = parseInt(total, 10);
  
  // Limit to maximum 5 questions per request for list mode
  if (mode === "list" && totalQuestions > 5) {
    return res.status(400).json({
      error: { message: "Maximum 5 questions per request. Please split into multiple requests." }
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
      const response = await client.path(path).post({
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

    // Streaming mode for list
    if (stream) {
      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });
      
      // Get range from request body
      const { range } = req.body;
      const startQuestion = range?.start || 1;
      const endQuestion = range?.end || totalQuestions;
      
      // Send initial status
      res.write(`data: ${JSON.stringify({ 
        type: 'status', 
        message: 'Starting generation...', 
        total: totalQuestions,
        completed: 0 
      })}\n\n`);
      
      // Force flush initial status
      if (res.flush) res.flush();

      let completedQuestions = 0;
      
      // Generate questions using the specified range
      for (let questionIndex = startQuestion; questionIndex <= endQuestion; questionIndex++) {
        try {
          // Send progress update
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            message: `Generating question ${questionIndex}...`,
            completed: completedQuestions,
            total: totalQuestions,
            current: questionIndex
          })}\n\n`);
          
          if (res.flush) res.flush();

          const questionBody = {
            prompt,
            mode,
            difficulty,
            reference,
            type,
            total: 1, // Generate only 1 question at a time
            range: { start: questionIndex, end: questionIndex },
            lang
          };

          const messages = generatePrompt(questionBody);
          const apiResponse = await client.path(path).post({
            body: {
              messages,
              max_tokens: 16384,
              top_p: 1.0,
              temperature: 0.65,
            }
          });

          const content = apiResponse?.body?.choices[0]?.message?.content || "";
          
          // Parse the single question result
          if (content.trim()) {
            const results = content.split("<_>").map(item => item.trim()).filter(item => item);
            
            // Process each result (should be only 1, but handle multiple just in case)
            results.forEach((item) => {
              const [questionPrompt, thisDifficulty, questionType] = item.split("|->").map(part => part.trim());
              const settingDifficulty = difficulty === "Acak" ? thisDifficulty : difficulty;
              
              const questionData = { 
                prompt: questionPrompt, 
                difficulty: settingDifficulty, 
                type: questionType || type,
                index: completedQuestions
              };

              // Send question immediately
              res.write(`data: ${JSON.stringify({
                type: 'question',
                data: questionData,
                completed: completedQuestions + 1,
                total: totalQuestions
              })}\n\n`);
              
              // Force flush to ensure immediate delivery
              if (res.flush) res.flush();
              
              completedQuestions++;
            });
          }

        } catch (error) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            message: `Error generating question ${questionIndex}: ${error.message}`,
            completed: completedQuestions,
            total: totalQuestions,
            current: questionIndex
          })}\n\n`);
          
          if (res.flush) res.flush();
        }
      }

      // Send completion status
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        message: 'Generation completed',
        completed: completedQuestions,
        total: totalQuestions
      })}\n\n`);
      
      if (res.flush) res.flush();
      res.end();
      return;
    }

    // Non-streaming mode - simplified to handle up to 5 questions directly
    const body = {
      prompt,
      mode,
      difficulty,
      reference,
      type,
      total: totalQuestions,
      range: { start: 1, end: totalQuestions },
      lang
    };

    const messages = generatePrompt(body);
    const apiResponse = await client.path(path).post({
      body: {
        messages,
        max_tokens: 16384,
        top_p: 1.0,
        temperature: 0.65,
      }
    });

    const content = apiResponse?.body?.choices[0]?.message?.content || "";
    res.status(200).json({ result: content });

  } catch (error) {
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
  const isId = lang === "id";

  let messages;

  if(mode === "detail"){
      messages = [
        {
          role: "system",
          content: isId ? systemPromptDetailId : systemPromptDetailEn,
        }
      ];

      if (lang === "id") {
        messages = [...messages, ...fineTuneDetailId];
      } else {
        messages = [...messages, ...fineTuneDetailEn];
      }
      const difficultyText = isId ? `tingkat kognitif Taksonomi Bloom ${difficulty}` : `Bloom's Taxonomy cognitive level ${difficulty}`;
      const typeText = isId ? `bertipe ${type}` : `question type ${type}`;
      const userContent = `|-[${prompt}]-| |-[${reference}]-| |-[${difficultyText}]-| |-[${typeText}]-|`;
      messages.push({
        role: "user",
        content: userContent,
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
      const difficultyText = isId ? `tingkat kognitif Taksonomi Bloom ${difficulty}` : `Bloom's Taxonomy cognitive level ${difficulty}`;
      const typeText = isId ? `bertipe ${type}` : `question type ${type}`;
      const rangeText = isId ? `soal mulai dari nomor ${range.start} sampai nomor ${range.end}` : `questions start from number ${range.start} to number ${range.end}`;
      const userContent = `|-[${prompt}]-| |-[${reference}]-| |-[${difficultyText}]-| |-[${typeText}]-| |-${rangeText}-|`;

      messages.push({
        role: "user",
        content: userContent,
      });
  }

  return messages;
}
