// import React, { useState, useEffect } from 'react';
// import { Line, Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from 'chart.js';
// import useJournalStore from '../store/journalStore';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// export default function Dashboard() {
//   const [content, setContent] = useState('');
//   const { entries, weeklySummary, isLoading, error, createEntry, fetchEntries, fetchWeeklySummary } = useJournalStore();

//   useEffect(() => {
//     console.log('Fetching initial data...');
//     fetchEntries();
//     fetchWeeklySummary();
//   }, [fetchEntries, fetchWeeklySummary]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!content.trim()) {
//       console.log('Empty content, skipping submission');
//       return;
//     }

//     console.log('Submitting entry:', content);
//     const success = await createEntry(content);
//     if (success) {
//       console.log('Entry created successfully');
//       setContent('');
//       fetchEntries();
//       fetchWeeklySummary();
//     } else {
//       console.log('Failed to create entry');
//     }
//   };

//   const sentimentData = {
//     labels: entries.map(entry => new Date(entry.createdAt).toLocaleDateString()),
//     datasets: [
//       {
//         label: 'Sentiment Score',
//         data: entries.map(entry => entry.sentimentScore),
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//     ],
//   };

//   const moodData = {
//     labels: Object.keys(useJournalStore.getState().getMoodDistribution()),
//     datasets: [
//       {
//         data: Object.values(useJournalStore.getState().getMoodDistribution()),
//         backgroundColor: [
//           '#FF6384',
//           '#36A2EB',
//           '#FFCE56',
//           '#4BC0C0',
//           '#9966FF',
//           '#FF9F40',
//           '#FF6384',
//           '#36A2EB',
//         ],
//       },
//     ],
//   };

//   return (
//     <div className="space-y-6">
//       <div className="card">
//         <h2 className="text-2xl font-semibold text-gray-900 mb-4">How are you feeling today?</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="Write your thoughts here..."
//               className="input-field min-h-[100px]"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="btn-primary"
//           >
//             {isLoading ? 'Analyzing...' : 'Submit Entry'}
//           </button>
//         </form>
//         {error && (
//           <div className="mt-4 rounded-md bg-red-50 p-4">
//             <div className="text-sm text-red-700">{error}</div>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Trend</h3>
//           <Line data={sentimentData} />
//         </div>

//         <div className="card">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Distribution</h3>
//           <Pie data={moodData} />
//         </div>
//       </div>

//       {weeklySummary && (
//         <div className="card">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
//           <div className="prose max-w-none">
//             <p className="text-gray-600 whitespace-pre-line">{weeklySummary.summary}</p>
//           </div>
//         </div>
//       )}

//       <div className="card">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Entries</h3>
//         <div className="space-y-4">
//           {entries.slice(0, 5).map((entry) => (
//             <div key={entry._id} className="border-b border-gray-200 pb-4 last:border-0">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-500">
//                     {new Date(entry.createdAt).toLocaleDateString()}
//                   </p>
//                   <p className="mt-1 text-gray-900">{entry.content}</p>
//                   <div className="mt-2 flex items-center space-x-2">
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
//                       {entry.mood}
//                     </span>
//                     {entry.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   Score: {entry.sentimentScore.toFixed(2)}
//                 </div>
//               </div>
//               <p className="mt-2 text-sm text-gray-600">{entry.aiFeedback}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// } 






import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import useJournalStore from '../store/journalStore';
import AIInsights from '../components/AIInsights';
import GamificationDashboard from '../components/GamificationDashboard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [content, setContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const {
    entries,
    weeklySummary,
    isLoading,
    error,
    createEntry,
    fetchEntries,
    fetchWeeklySummary,
  } = useJournalStore();

  useEffect(() => {
    fetchEntries();
    fetchWeeklySummary();
  }, [fetchEntries, fetchWeeklySummary]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await createEntry(content);
    if (success) {
      setContent('');
      fetchEntries();
      fetchWeeklySummary();
    }
  };

  const sentimentData = {
    labels: entries.map((entry) =>
      new Date(entry.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Sentiment Score',
        data: entries.map((entry) => entry.sentimentScore),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const sentimentOptions = {
    responsive: true,
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          stepSize: 0.5,
          callback: function(value) {
            if (value === 1) return '😊 Very Positive (1.0)';
            if (value === 0.5) return '🙂 Positive (0.5)';
            if (value === 0) return '😐 Neutral (0.0)';
            if (value === -0.5) return '🙁 Negative (-0.5)';
            if (value === -1) return '😢 Very Negative (-1.0)';
            return '';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const entry = entries[context.dataIndex];
            const score = context.raw;
            const mood = entry ? entry.mood : 'neutral';
            return ` Sentiment: ${score.toFixed(2)} (${mood.toUpperCase()})`;
          }
        }
      }
    }
  };

  const moodData = {
    labels: Object.keys(useJournalStore.getState().getMoodDistribution()),
    datasets: [
      {
        data: Object.values(useJournalStore.getState().getMoodDistribution()),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#36A2EB',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'overview'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setSelectedTab('insights')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'insights'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🧠 AI Insights
          </button>
          <button
            onClick={() => setSelectedTab('gamification')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
              selectedTab === 'gamification'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Progress
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <>
          {/* Entry Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How are you feeling today?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                className="input-field min-h-[100px]"
                required
              />
              
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Analyzing...' : 'Submit Entry'}
              </button>
            </form>
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sentiment Trend
              </h3>
              <Line data={sentimentData} options={sentimentOptions} />
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Mood Distribution
              </h3>
              <Pie data={moodData} />
            </div>
          </div>

          {/* Weekly Summary */}
          {weeklySummary && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Weekly Summary
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">
                  {(() => {
                    if (typeof weeklySummary === 'string') return weeklySummary;
                    if (weeklySummary.summary) {
                      if (typeof weeklySummary.summary === 'string') return weeklySummary.summary;
                      if (typeof weeklySummary.summary.summary === 'string') return weeklySummary.summary.summary;
                    }
                    return 'No summary available';
                  })()}
                </p>
              </div>
            </div>
          )}

          {/* Recent Entries */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Entries
            </h3>
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry._id}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-gray-900">{entry.content}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {entry.mood}
                        </span>
                        {entry.tags && entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {entry.sentimentScore !== undefined && entry.sentimentScore !== null ? entry.sentimentScore.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  {entry.aiFeedback && (
                    <p className="mt-2 text-sm text-gray-600">{entry.aiFeedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI Insights Tab */}
      {selectedTab === 'insights' && <AIInsights />}

      {/* Gamification Tab */}
      {selectedTab === 'gamification' && <GamificationDashboard />}
    </div>
  );
}
