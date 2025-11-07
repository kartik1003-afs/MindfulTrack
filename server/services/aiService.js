const axios = require('axios');
const JournalEntry = require('../models/JournalEntry');

const getLocalFallbackAnalysis = (content) => {
  const lowerText = (content || '').toLowerCase();
  
  const moodKeywords = {
    happy: ['joy', 'excited', 'cheerful', 'elated', 'delighted', 'content', 'pleased', 'upbeat', 'positive', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'smile', 'laugh'],
    sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'upset', 'disappointed', 'hurt', 'cry', 'tears', 'lonely', 'empty', 'hopeless', 'grief'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'overwhelmed', 'tense', 'restless', 'uneasy', 'concerned', 'troubled'],
    angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate', 'bitter', 'resentful', 'outraged', 'livid'],
    excited: ['excited', 'thrilled', 'energetic', 'pumped', 'enthusiastic', 'eager', 'motivated', 'inspired', 'passionate']
  };

  const scores = { happy: 0, sad: 0, anxious: 0, angry: 0, excited: 0 };
  let maxScore = 0;
  let detectedMood = 'neutral';

  Object.keys(moodKeywords).forEach(mood => {
    moodKeywords[mood].forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[mood] += 1;
      }
    });
    if (scores[mood] > maxScore) {
      maxScore = scores[mood];
      detectedMood = mood;
    }
  });

  let sentimentScore = 0;
  if (detectedMood === 'happy' || detectedMood === 'excited') sentimentScore = 0.8;
  else if (detectedMood === 'sad' || detectedMood === 'angry') sentimentScore = -0.6;
  else if (detectedMood === 'anxious') sentimentScore = -0.3;

  let aiFeedback = "Thank you for sharing your thoughts. Keeping track of your feelings is a great step toward self-care.";
  if (detectedMood === 'sad') {
    aiFeedback = "It sounds like you're going through a tough time. Please remember to be gentle with yourself. You are not alone.";
  } else if (detectedMood === 'anxious') {
    aiFeedback = "It seems you might be feeling anxious or stressed. Try taking a few slow, deep breaths. You've got this.";
  } else if (detectedMood === 'happy' || detectedMood === 'excited') {
    aiFeedback = "It's wonderful to see you feeling positive! Keep capturing these bright moments.";
  } else if (detectedMood === 'angry') {
    aiFeedback = "It is completely okay to feel angry or frustrated. Try giving yourself some space to cool down and process.";
  }

  const tags = [detectedMood];
  if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('office')) tags.push('work');
  if (lowerText.includes('family') || lowerText.includes('friend') || lowerText.includes('love')) tags.push('relationships');

  return {
    mood: detectedMood,
    sentimentScore,
    aiFeedback,
    tags
  };
};

const getLocalWeeklySummaryFallback = (entries) => {
  if (!entries || entries.length === 0) {
    return { summary: "No entries found for the past week." };
  }

  const moods = entries.map(e => e.mood || 'neutral');
  const moodCounts = moods.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const dominantMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'neutral');

  let summary = `Over the past week, you recorded ${entries.length} journal entries. Your dominant mood has been "${dominantMood}". `;
  
  if (dominantMood === 'happy' || dominantMood === 'excited') {
    summary += "You seem to be experiencing a good period of positive emotions and energy. Keep doing what brings you joy!";
  } else if (dominantMood === 'sad' || dominantMood === 'anxious' || dominantMood === 'stressed') {
    summary += "It looks like this week has brought some emotional challenges. Remember that it's okay to have down days, and practicing gentle self-care can be very helpful.";
  } else {
    summary += "Your emotional state has been relatively balanced and stable. Consistent check-ins are a wonderful way to maintain self-awareness.";
  }

  return { summary };
};

const analyzeSentiment = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY is not defined. Using local fallback.");
      return getLocalFallbackAnalysis(content);
    }

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    }
    throw new Error('Invalid response structure from Gemini API');
  } catch (error) {
    console.error('AI Analysis Error, falling back to local analysis:', error.message);
    return getLocalFallbackAnalysis(content);
  }
};

// In-memory cache for weekly summaries
const weeklySummaryCache = new Map();

const generateWeeklySummary = async (entries, userId) => {
  try {
    if (!entries || entries.length === 0) {
      return { summary: "No entries found for the past week." };
    }

    // Cache lookup based on userId, number of entries, and last entry ID
    const lastEntry = entries[entries.length - 1];
    const lastEntryKey = lastEntry ? (lastEntry._id || lastEntry.createdAt) : '';
    const cacheKey = `${userId || 'anon'}_${entries.length}_${lastEntryKey}`;

    if (weeklySummaryCache.has(cacheKey)) {
      console.log(`📋 Cache Hit: Returning cached weekly summary for user ${userId || 'anon'}`);
      return weeklySummaryCache.get(cacheKey);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY is not defined. Using local weekly summary fallback.");
      return getLocalWeeklySummaryFallback(entries);
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const summaryText = response.data.candidates[0].content.parts[0].text;
      const result = { summary: summaryText };
      // Save to cache
      weeklySummaryCache.set(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response structure from Gemini API for weekly summary');
  } catch (error) {
    console.error('Weekly Summary Gemini Error, falling back:', error.message);
    return getLocalWeeklySummaryFallback(entries);
  }
};

module.exports = {
  analyzeSentiment,
  generateWeeklySummary
};
