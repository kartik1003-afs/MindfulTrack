// const { OpenAI } = require('openai');
// const JournalEntry = require('../models/JournalEntry');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// const analyzeSentiment = async (content) => {
//   try {
//     const prompt = `Analyze the following journal entry and provide:
// 1. The primary mood (choose from: happy, sad, anxious, angry, neutral, excited, tired, stressed)
// 2. A sentiment score between -1 (very negative) and 1 (very positive)
// 3. Brief, supportive feedback or advice
// 4. Relevant tags (max 3)

// Journal entry: "${content}"

// Respond in JSON format:
// {
//   "mood": "mood",
//   "sentimentScore": number,
//   "aiFeedback": "feedback",
//   "tags": ["tag1", "tag2", "tag3"]
// }`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: "You are a mental health AI assistant. Analyze journal entries with empathy and provide supportive feedback."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 500
//     });

//     const result = JSON.parse(response.choices[0].message.content);
//     return result;
//   } catch (error) {
//     console.error('AI Analysis Error:', error);
//     throw new Error('Failed to analyze journal entry');
//   }
// };

// const generateWeeklySummary = async (entries) => {
//   try {
//     if (entries.length === 0) {
//       return { summary: "No entries found for the past week." };
//     }

//     const entriesText = entries.map(entry => 
//       `Date: ${entry.createdAt}\nMood: ${entry.mood}\nContent: ${entry.content}\n`
//     ).join('\n');

//     const prompt = `Analyze these journal entries from the past week and provide:
// 1. A summary of the overall emotional trend
// 2. Key patterns or recurring themes
// 3. Positive developments
// 4. Areas that might need attention
// 5. Gentle, supportive suggestions for self-care

// Entries:
// ${entriesText}

// Provide the response in a warm, supportive tone.`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: "You are a mental health AI assistant. Provide weekly summaries with empathy and actionable insights."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 1000
//     });

//     return { summary: response.choices[0].message.content };
//   } catch (error) {
//     console.error('Weekly Summary Error:', error);
//     throw new Error('Failed to generate weekly summary');
//   }
// };

// module.exports = {
//   analyzeSentiment,
//   generateWeeklySummary
// }; 



const axios = require('axios');
const JournalEntry = require('../models/JournalEntry');

const extractJson = (text) => {
  try {
    const match = text.match(/{[\s\S]*?}/);
    if (!match) throw new Error('No JSON object found in response');
    return JSON.parse(match[0]);
  } catch (err) {
    console.error('❌ Failed to extract JSON:', text);
    throw new Error('Could not extract JSON from AI response');
  }
};

const analyzeSentiment = async (content) => {
  try {
    const prompt = `Analyze the following journal entry and provide:
1. The primary mood (choose from: happy, sad, anxious, angry, neutral, excited, tired, stressed)
2. A sentiment score between -1 (very negative) and 1 (very positive)
3. Brief, supportive feedback or advice
4. Relevant tags (max 3)

Journal entry: "${content}"

Respond in JSON format:
{
  "mood": "mood",
  "sentimentScore": number,
  "aiFeedback": "feedback",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: false
    });

    const text = response.data.response;
   // console.log("📤 Ollama Response:", text);

    const result = extractJson(text);
    return result;
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    throw new Error('Failed to analyze journal entry');
  }
};

const generateWeeklySummary = async (entries) => {
  try {
    if (entries.length === 0) {
      return { summary: "No entries found for the past week." };
    }

    const entriesText = entries.map(entry => 
      `Date: ${entry.createdAt}\nMood: ${entry.mood}\nContent: ${entry.content}\n`
    ).join('\n');

    const prompt = `Analyze these journal entries from the past week and provide:
1. A summary of the overall emotional trend
2. Key patterns or recurring themes
3. Positive developments
4. Areas that might need attention
5. Gentle, supportive suggestions for self-care

Entries:
${entriesText}

Provide the response in a warm, supportive tone.`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt: prompt,
      stream: false
    });

    return { summary: response.data.response };
  } catch (error) {
    console.error('Weekly Summary Error:', error.message);
    throw new Error('Failed to generate weekly summary');
  }
};

module.exports = {
  analyzeSentiment,
  generateWeeklySummary
};
