// import React, { useEffect } from 'react';
// import { Line, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import useJournalStore from '../store/journalStore';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function WeeklySummary() {
//   const { entries, weeklySummary, isLoading, error, fetchEntries, fetchWeeklySummary } = useJournalStore();

//   useEffect(() => {
//     fetchEntries();
//     fetchWeeklySummary();
//   }, [fetchEntries, fetchWeeklySummary]);

//   const getMoodFrequency = () => {
//     const moodCount = entries.reduce((acc, entry) => {
//       acc[entry.mood] = (acc[entry.mood] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       labels: Object.keys(moodCount),
//       datasets: [
//         {
//           label: 'Mood Frequency',
//           data: Object.values(moodCount),
//           backgroundColor: 'rgba(14, 165, 233, 0.5)',
//           borderColor: 'rgb(14, 165, 233)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   const getSentimentByDay = () => {
//     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const sentimentByDay = entries.reduce((acc, entry) => {
//       const day = new Date(entry.createdAt).getDay();
//       if (!acc[day]) {
//         acc[day] = { sum: 0, count: 0 };
//       }
//       acc[day].sum += entry.sentimentScore;
//       acc[day].count += 1;
//       return acc;
//     }, {});

//     const averages = days.map((_, index) => {
//       const dayData = sentimentByDay[index];
//       return dayData ? dayData.sum / dayData.count : 0;
//     });

//     return {
//       labels: days,
//       datasets: [
//         {
//           label: 'Average Sentiment',
//           data: averages,
//           borderColor: 'rgb(75, 192, 192)',
//           tension: 0.1,
//         },
//       ],
//     };
//   };

//   const getTagFrequency = () => {
//     const tagCount = entries.reduce((acc, entry) => {
//       entry.tags.forEach(tag => {
//         acc[tag] = (acc[tag] || 0) + 1;
//       });
//       return acc;
//     }, {});

//     return {
//       labels: Object.keys(tagCount),
//       datasets: [
//         {
//           label: 'Tag Frequency',
//           data: Object.values(tagCount),
//           backgroundColor: 'rgba(14, 165, 233, 0.5)',
//           borderColor: 'rgb(14, 165, 233)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-gray-600">Loading summary...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rounded-md bg-red-50 p-4">
//         <div className="text-sm text-red-700">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="card">
//         <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weekly Summary</h2>
//         {weeklySummary ? (
//           <div className="prose max-w-none">
//             <p className="text-gray-600 whitespace-pre-line">{weeklySummary.summary}</p>
//           </div>
//         ) : (
//           <p className="text-gray-600">No summary available for this week.</p>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Distribution</h3>
//           <Bar data={getMoodFrequency()} />
//         </div>

//         <div className="card">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment by Day</h3>
//           <Line data={getSentimentByDay()} />
//         </div>
//       </div>

//       <div className="card">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Common Themes</h3>
//         <Bar data={getTagFrequency()} />
//       </div>

//       <div className="card">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Insights</h3>
//         <div className="space-y-4">
//           <div>
//             <h4 className="text-sm font-medium text-gray-900">Most Common Mood</h4>
//             <p className="mt-1 text-gray-600">
//               {Object.entries(getMoodFrequency().datasets[0].data).reduce((a, b) => 
//                 a[1] > b[1] ? a : b
//               )[0]}
//             </p>
//           </div>
//           <div>
//             <h4 className="text-sm font-medium text-gray-900">Average Sentiment Score</h4>
//             <p className="mt-1 text-gray-600">
//               {(entries.reduce((acc, entry) => acc + entry.sentimentScore, 0) / entries.length).toFixed(2)}
//             </p>
//           </div>
//           <div>
//             <h4 className="text-sm font-medium text-gray-900">Most Active Day</h4>
//             <p className="mt-1 text-gray-600">
//               {getSentimentByDay().labels[
//                 getSentimentByDay().datasets[0].data.indexOf(
//                   Math.max(...getSentimentByDay().datasets[0].data)
//                 )
//               ]}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } 





import React, { useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useJournalStore from '../store/journalStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklySummary() {
  const { entries, weeklySummary, isLoading, error, fetchEntries, fetchWeeklySummary } = useJournalStore();

  useEffect(() => {
    fetchEntries();
    fetchWeeklySummary();
  }, [fetchEntries, fetchWeeklySummary]);

  const getMoodFrequency = () => {
    const moodCount = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(moodCount),
      datasets: [
        {
          label: 'Mood Frequency',
          data: Object.values(moodCount),
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getSentimentByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sentimentByDay = entries.reduce((acc, entry) => {
      const day = new Date(entry.createdAt).getDay();
      if (!acc[day]) {
        acc[day] = { sum: 0, count: 0 };
      }
      acc[day].sum += entry.sentimentScore;
      acc[day].count += 1;
      return acc;
    }, {});

    const averages = days.map((_, index) => {
      const dayData = sentimentByDay[index];
      return dayData ? dayData.sum / dayData.count : 0;
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Average Sentiment',
          data: averages,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  const getTagFrequency = () => {
    const tagCount = entries.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      labels: Object.keys(tagCount),
      datasets: [
        {
          label: 'Tag Frequency',
          data: Object.values(tagCount),
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 animate-pulse">Analyzing your week, please wait...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weekly Summary</h2>
        {weeklySummary && weeklySummary.summary ? (
          <div className="prose max-w-none">
            <p className="text-gray-600 whitespace-pre-line">{weeklySummary.summary}</p>
          </div>
        ) : (
          <p className="text-gray-600">No summary available for this week.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Distribution</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500">No data for chart</p>
          ) : (
            <Bar data={getMoodFrequency()} />
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment by Day</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500">No data for chart</p>
          ) : (
            <Line data={getSentimentByDay()} />
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Common Themes</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500">No tags to display</p>
        ) : (
          <Bar data={getTagFrequency()} />
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Insights</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Most Common Mood</h4>
            <p className="mt-1 text-gray-600">
              {(() => {
                const moodData = getMoodFrequency();
                const maxIndex = moodData.datasets[0].data.indexOf(Math.max(...moodData.datasets[0].data));
                return moodData.labels[maxIndex] || 'N/A';
              })()}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Average Sentiment Score</h4>
            <p className="mt-1 text-gray-600">
              {entries.length === 0
                ? 'N/A'
                : (entries.reduce((acc, entry) => acc + entry.sentimentScore, 0) / entries.length).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Most Active Day</h4>
            <p className="mt-1 text-gray-600">
              {(() => {
                const sentimentData = getSentimentByDay();
                const maxVal = Math.max(...sentimentData.datasets[0].data);
                const idx = sentimentData.datasets[0].data.indexOf(maxVal);
                return sentimentData.labels[idx] || 'N/A';
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
