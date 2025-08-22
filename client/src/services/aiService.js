class AIService {
  constructor() {
    this.moodKeywords = {
      happy: ['joy', 'excited', 'cheerful', 'elated', 'delighted', 'content', 'pleased', 'upbeat', 'positive', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'smile', 'laugh'],
      sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'upset', 'disappointed', 'hurt', 'cry', 'tears', 'lonely', 'empty', 'hopeless', 'grief'],
      anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'overwhelmed', 'tense', 'restless', 'uneasy', 'concerned', 'troubled'],
      angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate', 'bitter', 'resentful', 'outraged', 'livid'],
      peaceful: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'zen', 'balanced', 'centered', 'quiet', 'still', 'mindful'],
      excited: ['excited', 'thrilled', 'energetic', 'pumped', 'enthusiastic', 'eager', 'motivated', 'inspired', 'passionate'],
      grateful: ['grateful', 'thankful', 'blessed', 'appreciative', 'fortunate', 'lucky', 'valued']
    };

    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die', 
      'hurt myself', 'self harm', 'cut myself', 'no point', 'give up',
      'hopeless', 'worthless', 'burden', 'everyone would be better without me',
      'can\'t go on', 'too much pain', 'nothing matters'
    ];

    this.positivePatterns = [
      'feeling better', 'good day', 'made progress', 'accomplished', 'proud of',
      'grateful for', 'looking forward', 'positive change', 'breakthrough'
    ];
  }

  // Predict mood from journal entry text
  predictMood(text) {
    if (!text || typeof text !== 'string') {
      return { mood: 'neutral', confidence: 0, analysis: 'No text provided' };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const moodScores = {};

    // Initialize mood scores
    Object.keys(this.moodKeywords).forEach(mood => {
      moodScores[mood] = 0;
    });

    // Calculate mood scores based on keyword matches
    words.forEach(word => {
      Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
        keywords.forEach(keyword => {
          if (word.includes(keyword) || keyword.includes(word)) {
            moodScores[mood] += 1;
          }
        });
      });
    });

    // Find the mood with highest score
    const maxScore = Math.max(...Object.values(moodScores));
    const predictedMood = Object.keys(moodScores).find(mood => moodScores[mood] === maxScore);

    // Calculate confidence based on score relative to text length
    const confidence = Math.min((maxScore / Math.max(words.length * 0.1, 1)) * 100, 100);

    return {
      mood: predictedMood || 'neutral',
      confidence: Math.round(confidence),
      analysis: this.generateMoodAnalysis(moodScores, words.length),
      allScores: moodScores
    };
  }

  // Generate analysis text for mood prediction
  generateMoodAnalysis(moodScores, wordCount) {
    const sortedMoods = Object.entries(moodScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    if (sortedMoods.length === 0) {
      return 'Neutral tone detected with no strong emotional indicators.';
    }

    const topMood = sortedMoods[0];
    const analysis = [`Primary emotion: ${topMood[0]} (${topMood[1]} indicators)`];

    if (sortedMoods.length > 1) {
      analysis.push(`Secondary emotions: ${sortedMoods.slice(1, 3).map(([mood]) => mood).join(', ')}`);
    }

    return analysis.join('. ');
  }

  // Detect crisis language in journal entries
  detectCrisis(text) {
    if (!text || typeof text !== 'string') {
      return { isCrisis: false, confidence: 0, triggers: [] };
    }

    const lowerText = text.toLowerCase();
    const triggers = [];
    let crisisScore = 0;

    this.crisisKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        triggers.push(keyword);
        crisisScore += keyword.split(' ').length; // Multi-word phrases get higher weight
      }
    });

    const isCrisis = crisisScore > 0;
    const confidence = Math.min((crisisScore / Math.max(text.split(' ').length * 0.05, 1)) * 100, 100);

    return {
      isCrisis,
      confidence: Math.round(confidence),
      triggers,
      severity: this.calculateCrisisSeverity(crisisScore, triggers)
    };
  }

  // Calculate crisis severity level
  calculateCrisisSeverity(score, triggers) {
    const highRiskTriggers = ['suicide', 'kill myself', 'end it all', 'want to die'];
    const hasHighRisk = triggers.some(trigger => highRiskTriggers.includes(trigger));

    if (hasHighRisk || score > 5) return 'high';
    if (score > 2) return 'medium';
    if (score > 0) return 'low';
    return 'none';
  }

  // Generate personalized insights based on mood patterns
  generatePersonalizedInsights(entries) {
    if (!entries || entries.length === 0) {
      return {
        insights: ['Start journaling regularly to receive personalized insights!'],
        recommendations: ['Try to write at least one journal entry per day'],
        patterns: {}
      };
    }

    const insights = [];
    const recommendations = [];
    const patterns = this.analyzeMoodPatterns(entries);

    // Mood trend analysis
    if (patterns.trendDirection === 'improving') {
      insights.push('🌟 Your mood has been trending upward recently - keep up the great work!');
      recommendations.push('Continue with the activities and habits that are working for you');
    } else if (patterns.trendDirection === 'declining') {
      insights.push('📉 Your mood has been declining recently. Consider reaching out for support.');
      recommendations.push('Focus on self-care activities and consider speaking with a mental health professional');
    } else {
      insights.push('📊 Your mood has been relatively stable recently');
    }

    // Frequency insights
    if (patterns.mostFrequentMood) {
      insights.push(`🎯 Your most common mood is "${patterns.mostFrequentMood}" (${patterns.moodFrequency[patterns.mostFrequentMood]} times)`);
    }

    // Streak insights
    if (patterns.currentStreak > 7) {
      insights.push(`🔥 Amazing! You've been journaling for ${patterns.currentStreak} days straight!`);
    } else if (patterns.currentStreak > 3) {
      insights.push(`✨ Great job maintaining a ${patterns.currentStreak}-day journaling streak!`);
    }

    // Pattern-based recommendations
    if (patterns.moodVariability === 'high') {
      recommendations.push('Your mood varies significantly - try meditation or mindfulness exercises');
    }

    if (patterns.positiveRatio < 0.4) {
      recommendations.push('Consider incorporating more positive activities into your routine');
      recommendations.push('Practice gratitude by writing down 3 things you\'re thankful for each day');
    }

    return {
      insights,
      recommendations,
      patterns,
      summary: this.generateInsightSummary(patterns)
    };
  }

  // Analyze mood patterns from journal entries
  analyzeMoodPatterns(entries) {
    const moods = entries.map(entry => entry.mood?.toLowerCase() || 'neutral');
    const recentMoods = entries.slice(-7).map(entry => entry.mood?.toLowerCase() || 'neutral');
    
    // Mood frequency
    const moodFrequency = {};
    moods.forEach(mood => {
      moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
    });

    const mostFrequentMood = Object.keys(moodFrequency).reduce((a, b) => 
      moodFrequency[a] > moodFrequency[b] ? a : b
    );

    // Trend analysis
    const moodValues = moods.map(mood => this.getMoodValue(mood));
    const recentMoodValues = recentMoods.map(mood => this.getMoodValue(mood));
    
    const overallAvg = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    const recentAvg = recentMoodValues.reduce((a, b) => a + b, 0) / recentMoodValues.length;
    
    let trendDirection = 'stable';
    if (recentAvg > overallAvg + 0.5) trendDirection = 'improving';
    else if (recentAvg < overallAvg - 0.5) trendDirection = 'declining';

    // Variability
    const variance = moodValues.reduce((acc, val) => acc + Math.pow(val - overallAvg, 2), 0) / moodValues.length;
    const moodVariability = variance > 2 ? 'high' : variance > 1 ? 'medium' : 'low';

    // Positive ratio
    const positiveMoods = ['happy', 'excited', 'peaceful', 'grateful'];
    const positiveCount = moods.filter(mood => positiveMoods.includes(mood)).length;
    const positiveRatio = positiveCount / moods.length;

    // Journaling streak
    const currentStreak = this.calculateJournalingStreak(entries);

    return {
      mostFrequentMood,
      moodFrequency,
      trendDirection,
      moodVariability,
      positiveRatio,
      currentStreak,
      overallAverage: overallAvg,
      recentAverage: recentAvg
    };
  }

  // Convert mood to numerical value for analysis
  getMoodValue(mood) {
    const moodValues = {
      'sad': 1,
      'angry': 2,
      'anxious': 2.5,
      'neutral': 3,
      'peaceful': 4,
      'grateful': 4.5,
      'happy': 5,
      'excited': 5
    };
    return moodValues[mood] || 3;
  }

  // Calculate current journaling streak
  calculateJournalingStreak(entries) {
    if (!entries || entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Generate summary of insights
  generateInsightSummary(patterns) {
    const { mostFrequentMood, trendDirection, positiveRatio, currentStreak } = patterns;
    
    let summary = `Your mental health journey shows `;
    
    if (trendDirection === 'improving') {
      summary += 'positive progress with improving mood trends. ';
    } else if (trendDirection === 'declining') {
      summary += 'some challenges with declining mood trends. ';
    } else {
      summary += 'stable mood patterns. ';
    }

    summary += `Your dominant mood is "${mostFrequentMood}" and you've maintained a ${currentStreak}-day journaling streak. `;

    if (positiveRatio > 0.6) {
      summary += 'You\'re experiencing predominantly positive emotions.';
    } else if (positiveRatio < 0.4) {
      summary += 'Consider focusing on activities that boost positive emotions.';
    } else {
      summary += 'You\'re experiencing a balanced mix of emotions.';
    }

    return summary;
  }

  // Generate smart reminders based on user patterns
  generateSmartReminders(entries, userPreferences = {}) {
    const patterns = this.analyzeMoodPatterns(entries);
    const reminders = [];

    // Time-based reminders
    const lastEntry = entries[entries.length - 1];
    const daysSinceLastEntry = lastEntry ? 
      Math.floor((Date.now() - new Date(lastEntry.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

    if (daysSinceLastEntry > 2) {
      reminders.push({
        type: 'journal',
        priority: 'high',
        message: 'You haven\'t journaled in a few days. How are you feeling today?',
        action: 'journal_entry'
      });
    }

    // Mood-based reminders
    if (patterns.recentAverage < 2.5) {
      reminders.push({
        type: 'wellness',
        priority: 'high',
        message: 'Your recent mood has been low. Consider some self-care activities.',
        action: 'self_care_suggestions'
      });
    }

    // Streak maintenance
    if (patterns.currentStreak > 5 && daysSinceLastEntry === 1) {
      reminders.push({
        type: 'motivation',
        priority: 'medium',
        message: `Don't break your ${patterns.currentStreak}-day streak! Quick check-in?`,
        action: 'quick_journal'
      });
    }

    // Positive reinforcement
    if (patterns.trendDirection === 'improving') {
      reminders.push({
        type: 'celebration',
        priority: 'low',
        message: 'Your mood has been improving! Keep up the great work! 🌟',
        action: 'view_progress'
      });
    }

    return reminders.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Get crisis resources and suggestions
  getCrisisResources() {
    return {
      immediate: [
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          description: '24/7 crisis support'
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          description: 'Free 24/7 crisis support via text'
        }
      ],
      professional: [
        {
          name: 'Psychology Today',
          url: 'https://www.psychologytoday.com',
          description: 'Find mental health professionals near you'
        },
        {
          name: 'SAMHSA Treatment Locator',
          url: 'https://findtreatment.samhsa.gov',
          description: 'Find mental health and substance abuse treatment'
        }
      ],
      selfCare: [
        'Take deep breaths - try the 4-7-8 breathing technique',
        'Reach out to a trusted friend or family member',
        'Go for a walk or do light exercise',
        'Listen to calming music or nature sounds',
        'Practice grounding techniques (5-4-3-2-1 method)',
        'Write down your feelings in detail'
      ]
    };
  }
}

export default new AIService();
