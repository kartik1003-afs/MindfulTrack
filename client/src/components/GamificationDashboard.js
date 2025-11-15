import React, { useState, useEffect } from 'react';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  FlagIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import useGamificationStore from '../store/gamificationStore';
import useJournalStore from '../store/journalStore';

export default function GamificationDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: 'streak', target: 7, name: '', description: '' });
  const [newAchievements, setNewAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { entries } = useJournalStore();
  const {
    achievements,
    badges,
    currentStreak,
    longestStreak,
    totalPoints,
    level,
    moodGoals,
    weeklyProgress,
    moodGoalTemplates,
    initializeGamification,
    updateProgress,
    createMoodGoal,
    updateMoodGoalProgress,
    getStats
  } = useGamificationStore();

  useEffect(() => {
    initializeGamification(entries);
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      const result = updateProgress(entries);
      const completedGoals = updateMoodGoalProgress(entries);
      
      if (result.newAchievements.length > 0 || result.newBadges.length > 0 || completedGoals.length > 0) {
        setNewAchievements([...result.newAchievements, ...result.newBadges, ...completedGoals]);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    }
  }, [entries]);

  const stats = getStats();

  const handleCreateGoal = (template = null) => {
    console.log('Creating goal with data:', { template, newGoal });
    
    const goalData = template || {
      name: newGoal.name,
      description: newGoal.description,
      type: newGoal.type,
      target: newGoal.target,
      duration: 30,
      reward: Math.max(newGoal.target * 5, 25)
    };

    console.log('Final goal data:', goalData);
    
    try {
      const createdGoal = createMoodGoal(goalData);
      console.log('Goal created successfully:', createdGoal);
      setShowNewGoalModal(false);
      setNewGoal({ type: 'streak', target: 7, name: '', description: '' });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatGoalProgress = (goal) => {
    switch (goal.type) {
      case 'streak':
        return `${goal.progress}/${goal.target} days`;
      case 'mood_average':
        return `${goal.progress}/${goal.target} avg mood`;
      case 'positive_days':
        return `${goal.progress}/${goal.target} positive days`;
      case 'entry_count':
        return `${goal.progress}/${goal.target} entries`;
      default:
        return `${goal.progress}/${goal.target}`;
    }
  };

  // Celebration Modal
  const CelebrationModal = () => (
    showCelebration && newAchievements.length > 0 && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h3>
          <p className="text-gray-600 mb-4">You've earned new rewards!</p>
          
          <div className="space-y-2 mb-4">
            {newAchievements.map((item, index) => (
              <div key={index} className="flex items-center justify-center bg-yellow-50 rounded-lg p-3">
                <span className="text-2xl mr-3">{item.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.points && (
                    <div className="text-xs text-yellow-600">+{item.points} points</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowCelebration(false)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Awesome!
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <CelebrationModal />
      
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Level</p>
              <p className="text-2xl font-bold">{stats.level}</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-200" />
          </div>
          <div className="mt-2">
            <div className="bg-yellow-300 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${Math.max(10, (stats.totalPoints % (stats.level * stats.level * 100)) / (stats.level * stats.level * 100) * 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-yellow-100 mt-1">
              {stats.pointsToNextLevel} points to next level
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Current Streak</p>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
            </div>
            <FireIcon className="h-8 w-8 text-red-200" />
          </div>
          <p className="text-xs text-red-100 mt-2">
            Best: {stats.longestStreak} days
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Points</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
            <TrophyIcon className="h-8 w-8 text-purple-200" />
          </div>
          <p className="text-xs text-purple-100 mt-2">
            {stats.achievementCount} achievements
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Goals</p>
              <p className="text-2xl font-bold">{stats.completedGoals}</p>
            </div>
            <FlagIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-xs text-green-100 mt-2">
            {moodGoals.length} total goals
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'overview'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrophyIcon className="h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('achievements')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'achievements'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <StarIcon className="h-4 w-4 mr-2" />
            Achievements
          </button>
          <button
            onClick={() => setSelectedTab('goals')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'goals'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FlagIcon className="w-4 h-4 mr-2" />
            Goals
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Weekly Progress */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">This Week's Progress</h3>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(weeklyProgress?.dailyProgress || {}).map(([day, progress]) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{day.slice(0, 3)}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      progress.hasEntry 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {progress.hasEntry ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {weeklyProgress?.weeklyStreak || 0}/7 days this week
              </p>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.slice(-4).map((achievement, index) => (
                  <div key={index} className="flex items-center bg-yellow-50 rounded-lg p-3">
                    <span className="text-2xl mr-3">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{achievement.name}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="text-xs text-yellow-600">+{achievement.points} points</div>
                    </div>
                  </div>
                ))}
              </div>
              {achievements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Start journaling to earn your first achievements! 🏆
                </p>
              )}
            </div>

            {/* Active Goals */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Goals</h3>
              <div className="space-y-3">
                {moodGoals.filter(goal => !goal.completed).slice(0, 3).map((goal, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className="text-sm text-blue-600">{formatGoalProgress(goal)}</span>
                    </div>
                    <div className="bg-blue-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${getProgressPercentage(goal.progress, goal.target)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                ))}
              </div>
              {moodGoals.filter(goal => !goal.completed).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No active goals. Create one to stay motivated! 🎯
                </p>
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Your Achievements</h3>
              <div className="text-sm text-gray-500">
                {achievements.length} earned • {badges.length} badges
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Badges</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{badge.name}</div>
                    <div className="text-xs text-gray-600">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Achievements */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">All Achievements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center bg-yellow-50 rounded-lg p-4">
                    <span className="text-3xl mr-4">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{achievement.name}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-yellow-600">+{achievement.points} points</span>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {achievements.length === 0 && (
                <div className="text-center py-8">
                  <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">No achievements yet</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Start journaling to unlock your first achievement!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {selectedTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Mood Goals</h3>
              <button
                onClick={() => setShowNewGoalModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Goal
              </button>
            </div>

            {/* Quick Goal Templates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Quick Start Goals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {moodGoalTemplates.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <span className="text-sm text-green-600">+{template.reward} pts</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <button
                      onClick={() => handleCreateGoal(template)}
                      className="w-full bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-200"
                    >
                      Start This Goal
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Goals */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Your Goals</h4>
              <div className="space-y-4">
                {moodGoals.map((goal, index) => (
                  <div key={index} className={`rounded-lg p-4 ${
                    goal.completed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {goal.completed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        <h5 className="font-medium text-gray-900">{goal.name}</h5>
                      </div>
                      <span className={`text-sm ${goal.completed ? 'text-green-600' : 'text-blue-600'}`}>
                        {formatGoalProgress(goal)}
                      </span>
                    </div>
                    
                    <div className={`rounded-full h-2 mb-2 ${goal.completed ? 'bg-green-200' : 'bg-blue-200'}`}>
                      <div
                        className={`rounded-full h-2 transition-all duration-500 ${
                          goal.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${getProgressPercentage(goal.progress, goal.target)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    
                    {goal.completed && (
                      <div className="mt-2 text-xs text-green-600">
                        ✅ Completed on {new Date(goal.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {moodGoals.length === 0 && (
                <div className="text-center py-8">
                  <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">No goals set</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first goal to stay motivated on your mental health journey!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g., Weekly Journaling Challenge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows="2"
                  placeholder="Describe your goal..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="streak">Journaling Streak</option>
                  <option value="entry_count">Number of Entries</option>
                  <option value="positive_days">Positive Mood Days</option>
                  <option value="mood_average">Average Mood Score</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateGoal()}
                disabled={!newGoal.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
