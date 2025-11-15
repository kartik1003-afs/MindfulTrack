import { create } from 'zustand';
import aiService from '../services/aiService';

const useGamificationStore = create((set, get) => ({
  // State
  achievements: [],
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  level: 1,
  moodGoals: [],
  badges: [],
  streakHistory: [],
  weeklyProgress: {},
  
  // Achievement definitions
  achievementDefinitions: [
    {
      id: 'first_entry',
      name: 'First Steps',
      description: 'Write your first journal entry',
      icon: '✍️',
      points: 10,
      type: 'milestone',
      condition: (data) => data.totalEntries >= 1
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Journal for 7 consecutive days',
      icon: '🔥',
      points: 50,
      type: 'streak',
      condition: (data) => data.currentStreak >= 7
    },
    {
      id: 'month_streak',
      name: 'Monthly Master',
      description: 'Journal for 30 consecutive days',
      icon: '🏆',
      points: 200,
      type: 'streak',
      condition: (data) => data.currentStreak >= 30
    },
    {
      id: 'positive_week',
      name: 'Sunshine Week',
      description: 'Maintain positive mood for a week',
      icon: '☀️',
      points: 75,
      type: 'mood',
      condition: (data) => data.positiveWeekStreak >= 7
    },
    {
      id: 'mood_variety',
      name: 'Emotional Explorer',
      description: 'Experience 5 different moods',
      icon: '🎭',
      points: 30,
      type: 'variety',
      condition: (data) => data.uniqueMoods >= 5
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Journal before 9 AM for 5 days',
      icon: '🌅',
      points: 40,
      type: 'habit',
      condition: (data) => data.earlyEntries >= 5
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Journal after 9 PM for 5 days',
      icon: '🦉',
      points: 40,
      type: 'habit',
      condition: (data) => data.lateEntries >= 5
    },
    {
      id: 'word_count_100',
      name: 'Wordsmith',
      description: 'Write an entry with 100+ words',
      icon: '📝',
      points: 25,
      type: 'content',
      condition: (data) => data.maxWordCount >= 100
    },
    {
      id: 'gratitude_master',
      name: 'Gratitude Master',
      description: 'Express gratitude in 10 entries',
      icon: '🙏',
      points: 60,
      type: 'content',
      condition: (data) => data.gratitudeEntries >= 10
    },
    {
      id: 'comeback_kid',
      name: 'Comeback Kid',
      description: 'Return to journaling after a 7+ day break',
      icon: '💪',
      points: 35,
      type: 'resilience',
      condition: (data) => data.comebackAfterBreak
    }
  ],

  // Badge definitions
  badgeDefinitions: [
    {
      id: 'streak_bronze',
      name: 'Bronze Streaker',
      description: '3-day streak',
      icon: '🥉',
      condition: (data) => data.currentStreak >= 3
    },
    {
      id: 'streak_silver',
      name: 'Silver Streaker',
      description: '14-day streak',
      icon: '🥈',
      condition: (data) => data.currentStreak >= 14
    },
    {
      id: 'streak_gold',
      name: 'Gold Streaker',
      description: '30-day streak',
      icon: '🥇',
      condition: (data) => data.currentStreak >= 30
    },
    {
      id: 'mood_stable',
      name: 'Steady Eddie',
      description: 'Low mood variability',
      icon: '⚖️',
      condition: (data) => data.moodVariability === 'low'
    },
    {
      id: 'positive_vibes',
      name: 'Positive Vibes',
      description: '70%+ positive moods',
      icon: '✨',
      condition: (data) => data.positiveRatio >= 0.7
    }
  ],

  // Actions
  initializeGamification: (entries) => {
    const data = get().calculateUserData(entries);
    const newAchievements = get().checkAchievements(data);
    const newBadges = get().checkBadges(data);
    
    set(state => ({
      currentStreak: data.currentStreak,
      longestStreak: Math.max(state.longestStreak, data.currentStreak),
      achievements: [...state.achievements, ...newAchievements],
      badges: [...state.badges, ...newBadges],
      totalPoints: state.totalPoints + newAchievements.reduce((sum, ach) => sum + ach.points, 0),
      level: get().calculateLevel(state.totalPoints + newAchievements.reduce((sum, ach) => sum + ach.points, 0))
    }));
  },

  updateProgress: (entries) => {
    const data = get().calculateUserData(entries);
    const state = get();
    
    // Check for new achievements
    const newAchievements = get().checkAchievements(data).filter(
      ach => !state.achievements.some(existing => existing.id === ach.id)
    );
    
    // Check for new badges
    const newBadges = get().checkBadges(data).filter(
      badge => !state.badges.some(existing => existing.id === badge.id)
    );
    
    const pointsEarned = newAchievements.reduce((sum, ach) => sum + ach.points, 0);
    const newTotalPoints = state.totalPoints + pointsEarned;
    
    set({
      currentStreak: data.currentStreak,
      longestStreak: Math.max(state.longestStreak, data.currentStreak),
      achievements: [...state.achievements, ...newAchievements],
      badges: [...state.badges, ...newBadges],
      totalPoints: newTotalPoints,
      level: get().calculateLevel(newTotalPoints),
      weeklyProgress: get().calculateWeeklyProgress(entries)
    });

    return {
      newAchievements,
      newBadges,
      pointsEarned,
      levelUp: get().calculateLevel(newTotalPoints) > get().calculateLevel(state.totalPoints)
    };
  },

  calculateUserData: (entries) => {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        uniqueMoods: 0,
        positiveRatio: 0,
        moodVariability: 'low',
        maxWordCount: 0,
        gratitudeEntries: 0,
        earlyEntries: 0,
        lateEntries: 0,
        positiveWeekStreak: 0,
        comebackAfterBreak: false
      };
    }

    const patterns = aiService.analyzeMoodPatterns(entries);
    const gratitudeKeywords = ['grateful', 'thankful', 'blessed', 'appreciate', 'thank'];
    
    // Calculate various metrics
    const gratitudeEntries = entries.filter(entry => 
      gratitudeKeywords.some(keyword => 
        entry.content?.toLowerCase().includes(keyword)
      )
    ).length;

    const earlyEntries = entries.filter(entry => {
      const hour = new Date(entry.createdAt).getHours();
      return hour < 9;
    }).length;

    const lateEntries = entries.filter(entry => {
      const hour = new Date(entry.createdAt).getHours();
      return hour >= 21;
    }).length;

    const maxWordCount = Math.max(...entries.map(entry => 
      entry.content ? entry.content.split(' ').length : 0
    ));

    const uniqueMoods = new Set(entries.map(entry => entry.mood?.toLowerCase()).filter(Boolean)).size;

    // Check for comeback after break
    const sortedEntries = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let comebackAfterBreak = false;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const daysBetween = Math.floor(
        (new Date(sortedEntries[i].createdAt) - new Date(sortedEntries[i-1].createdAt)) / (1000 * 60 * 60 * 24)
      );
      if (daysBetween >= 7) {
        comebackAfterBreak = true;
        break;
      }
    }

    // Calculate positive week streak
    const recentEntries = entries.slice(-7);
    const positiveMoods = ['happy', 'excited', 'peaceful', 'grateful'];
    const positiveWeekStreak = recentEntries.every(entry => 
      positiveMoods.includes(entry.mood?.toLowerCase())
    ) ? recentEntries.length : 0;

    return {
      totalEntries: entries.length,
      currentStreak: patterns.currentStreak,
      uniqueMoods,
      positiveRatio: patterns.positiveRatio,
      moodVariability: patterns.moodVariability,
      maxWordCount,
      gratitudeEntries,
      earlyEntries,
      lateEntries,
      positiveWeekStreak,
      comebackAfterBreak
    };
  },

  checkAchievements: (data) => {
    const state = get();
    const earnedAchievements = [];
    
    state.achievementDefinitions.forEach(achDef => {
      const alreadyEarned = state.achievements.some(ach => ach.id === achDef.id);
      if (!alreadyEarned && achDef.condition(data)) {
        earnedAchievements.push({
          ...achDef,
          earnedAt: new Date().toISOString()
        });
      }
    });
    
    return earnedAchievements;
  },

  checkBadges: (data) => {
    const state = get();
    const earnedBadges = [];
    
    state.badgeDefinitions.forEach(badgeDef => {
      const alreadyEarned = state.badges.some(badge => badge.id === badgeDef.id);
      if (!alreadyEarned && badgeDef.condition(data)) {
        earnedBadges.push({
          ...badgeDef,
          earnedAt: new Date().toISOString()
        });
      }
    });
    
    return earnedBadges;
  },

  calculateLevel: (points) => {
    // Level calculation: Level = floor(sqrt(points/100)) + 1
    return Math.floor(Math.sqrt(points / 100)) + 1;
  },

  getPointsForNextLevel: (currentPoints) => {
    const currentLevel = get().calculateLevel(currentPoints);
    const nextLevelPoints = Math.pow(currentLevel, 2) * 100;
    return nextLevelPoints - currentPoints;
  },

  calculateWeeklyProgress: (entries) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= weekStart
    );
    
    const dailyProgress = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach((day, index) => {
      const dayEntries = weekEntries.filter(entry => 
        new Date(entry.createdAt).getDay() === index
      );
      dailyProgress[day] = {
        hasEntry: dayEntries.length > 0,
        entryCount: dayEntries.length,
        avgMood: dayEntries.length > 0 ? 
          dayEntries.reduce((sum, entry) => sum + aiService.getMoodValue(entry.mood), 0) / dayEntries.length : 0
      };
    });
    
    return {
      weekStart: weekStart.toISOString(),
      dailyProgress,
      weeklyStreak: Object.values(dailyProgress).filter(day => day.hasEntry).length,
      totalWeekEntries: weekEntries.length
    };
  },

  // Mood Goals
  createMoodGoal: (goal) => {
    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      createdAt: new Date().toISOString(),
      progress: 0,
      completed: false
    };
    
    set(state => ({
      moodGoals: [...state.moodGoals, newGoal]
    }));
    
    return newGoal;
  },

  updateMoodGoalProgress: (entries) => {
    const state = get();
    const updatedGoals = state.moodGoals.map(goal => {
      if (goal.completed) return goal;
      
      const progress = get().calculateGoalProgress(goal, entries);
      const completed = progress >= goal.target;
      
      return {
        ...goal,
        progress,
        completed,
        completedAt: completed && !goal.completed ? new Date().toISOString() : goal.completedAt
      };
    });
    
    set({ moodGoals: updatedGoals });
    
    // Return newly completed goals
    return updatedGoals.filter((goal, index) => 
      goal.completed && !state.moodGoals[index].completed
    );
  },

  calculateGoalProgress: (goal, entries) => {
    const relevantEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= new Date(goal.createdAt)
    );
    
    switch (goal.type) {
      case 'streak':
        return aiService.calculateJournalingStreak(relevantEntries);
      
      case 'mood_average':
        if (relevantEntries.length === 0) return 0;
        const avgMood = relevantEntries.reduce((sum, entry) => 
          sum + aiService.getMoodValue(entry.mood), 0
        ) / relevantEntries.length;
        return Math.round(avgMood * 10) / 10; // Round to 1 decimal
      
      case 'positive_days':
        const positiveMoods = ['happy', 'excited', 'peaceful', 'grateful'];
        return relevantEntries.filter(entry => 
          positiveMoods.includes(entry.mood?.toLowerCase())
        ).length;
      
      case 'entry_count':
        return relevantEntries.length;
      
      default:
        return 0;
    }
  },

  // Predefined mood goal templates
  moodGoalTemplates: [
    {
      name: '7-Day Journaling Streak',
      description: 'Journal every day for a week',
      type: 'streak',
      target: 7,
      duration: 7, // days
      reward: 50
    },
    {
      name: 'Happy Week Challenge',
      description: 'Maintain average mood above 4.0 for a week',
      type: 'mood_average',
      target: 4.0,
      duration: 7,
      reward: 75
    },
    {
      name: '5 Positive Days',
      description: 'Have 5 days with positive mood this week',
      type: 'positive_days',
      target: 5,
      duration: 7,
      reward: 40
    },
    {
      name: 'Monthly Commitment',
      description: 'Write 20 journal entries this month',
      type: 'entry_count',
      target: 20,
      duration: 30,
      reward: 100
    }
  ],

  getStats: () => {
    const state = get();
    return {
      level: state.level,
      totalPoints: state.totalPoints,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      achievementCount: state.achievements.length,
      badgeCount: state.badges.length,
      completedGoals: state.moodGoals.filter(goal => goal.completed).length,
      pointsToNextLevel: get().getPointsForNextLevel(state.totalPoints)
    };
  }
}));

export default useGamificationStore;
