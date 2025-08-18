import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  HeartIcon, 
  BellIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import aiService from '../services/aiService';
import useJournalStore from '../store/journalStore';

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [crisisDetected, setCrisisDetected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('insights');
  const { entries } = useJournalStore();

  useEffect(() => {
    generateInsights();
  }, [entries]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      if (entries.length === 0) {
        setInsights({
          insights: ['Welcome to MindfulTrack! Start journaling to receive personalized AI insights.'],
          recommendations: ['Write your first journal entry to begin tracking your mental health journey'],
          patterns: {},
          summary: 'Begin your mental health journey by writing your first journal entry.'
        });
        setReminders([]);
        setCrisisDetected(null);
        return;
      }

      // Generate personalized insights
      const personalizedInsights = aiService.generatePersonalizedInsights(entries);
      setInsights(personalizedInsights);

      // Generate smart reminders
      const smartReminders = aiService.generateSmartReminders(entries);
      setReminders(smartReminders);

      // Check recent entries for crisis indicators
      const recentEntries = entries.slice(-5); // Check last 5 entries
      let highestCrisisRisk = { isCrisis: false, confidence: 0 };
      
      recentEntries.forEach(entry => {
        const crisisAnalysis = aiService.detectCrisis(entry.content);
        if (crisisAnalysis.confidence > highestCrisisRisk.confidence) {
          highestCrisisRisk = crisisAnalysis;
        }
      });

      if (highestCrisisRisk.isCrisis && highestCrisisRisk.confidence > 30) {
        setCrisisDetected(highestCrisisRisk);
      } else {
        setCrisisDetected(null);
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsights({
        insights: ['Unable to generate insights at this time.'],
        recommendations: ['Please try again later.'],
        patterns: {},
        summary: 'Insights temporarily unavailable.'
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissReminder = (index) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  const handleCrisisAction = (action) => {
    if (action === 'call_hotline') {
      window.open('tel:988', '_self');
    } else if (action === 'text_crisis') {
      window.open('sms:741741?body=HOME', '_self');
    } else if (action === 'dismiss') {
      setCrisisDetected(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Generating AI insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crisis Detection Alert */}
      {crisisDetected && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800">
                We're Here to Help
              </h3>
              <p className="text-sm text-red-700 mt-1">
                We've noticed some concerning language in your recent entries. Your mental health matters, and support is available.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-red-800">Immediate Support:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCrisisAction('call_hotline')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Call 988 (Suicide & Crisis Lifeline)
                  </button>
                  <button
                    onClick={() => handleCrisisAction('text_crisis')}
                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                  >
                    Text HOME to 741741
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-red-600">
                    If you're in immediate danger, please call 911 or go to your nearest emergency room.
                  </p>
                </div>
                <button
                  onClick={() => handleCrisisAction('dismiss')}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-2"
                >
                  I'm safe right now, dismiss this alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setSelectedTab('insights')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'insights'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LightBulbIcon className="h-4 w-4 mr-2" />
            AI Insights
          </button>
          <button
            onClick={() => setSelectedTab('reminders')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'reminders'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BellIcon className="h-4 w-4 mr-2" />
            Smart Reminders
            {reminders.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-600 text-xs rounded-full px-2 py-1">
                {reminders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('patterns')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'patterns'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Patterns
          </button>
        </div>

        {/* Insights Tab */}
        {selectedTab === 'insights' && insights && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <SparklesIcon className="h-6 w-6 text-primary-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Your Mental Health Summary
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {insights.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {insights.insights.map((insight, index) => (
                  <div key={index} className="flex items-start bg-yellow-50 rounded-lg p-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <HeartIcon className="h-5 w-5 text-pink-500 mr-2" />
                Personalized Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start bg-pink-50 rounded-lg p-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Smart Reminders Tab */}
        {selectedTab === 'reminders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 text-primary-600 mr-2" />
              Smart Reminders
            </h3>
            
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No reminders right now</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Keep journaling regularly and we'll provide helpful reminders based on your patterns.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border-l-4 ${
                      reminder.priority === 'high'
                        ? 'bg-red-50 border-red-400'
                        : reminder.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              reminder.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : reminder.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {reminder.type}
                          </span>
                          <span
                            className={`ml-2 text-xs ${
                              reminder.priority === 'high'
                                ? 'text-red-600'
                                : reminder.priority === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {reminder.priority} priority
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">
                          {reminder.message}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissReminder(index)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {selectedTab === 'patterns' && insights?.patterns && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
              Your Mood Patterns
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Frequent Mood */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Most Frequent Mood</h4>
                <div className="text-2xl font-bold text-purple-600 capitalize">
                  {insights.patterns.mostFrequentMood || 'N/A'}
                </div>
                {insights.patterns.moodFrequency && (
                  <p className="text-xs text-gray-600 mt-1">
                    {insights.patterns.moodFrequency[insights.patterns.mostFrequentMood]} times
                  </p>
                )}
              </div>

              {/* Mood Trend */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Trend</h4>
                <div className={`text-2xl font-bold capitalize ${
                  insights.patterns.trendDirection === 'improving' ? 'text-green-600' :
                  insights.patterns.trendDirection === 'declining' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {insights.patterns.trendDirection || 'Stable'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {insights.patterns.trendDirection === 'improving' ? '📈 Trending up' :
                   insights.patterns.trendDirection === 'declining' ? '📉 Needs attention' :
                   '➡️ Staying steady'}
                </p>
              </div>

              {/* Journaling Streak */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Streak</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {insights.patterns.currentStreak || 0} days
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  🔥 Keep it going!
                </p>
              </div>

              {/* Mood Variability */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Mood Stability</h4>
                <div className={`text-2xl font-bold capitalize ${
                  insights.patterns.moodVariability === 'low' ? 'text-green-600' :
                  insights.patterns.moodVariability === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {insights.patterns.moodVariability || 'Unknown'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {insights.patterns.moodVariability === 'low' ? '⚖️ Very stable' :
                   insights.patterns.moodVariability === 'medium' ? '📊 Moderately stable' :
                   '🎢 Quite variable'}
                </p>
              </div>
            </div>

            {/* Positive Ratio */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Positive Mood Ratio</h4>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                  <div
                    className="bg-gradient-to-r from-green-400 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(insights.patterns.positiveRatio || 0) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((insights.patterns.positiveRatio || 0) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Percentage of entries with positive moods (happy, excited, peaceful, grateful)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
