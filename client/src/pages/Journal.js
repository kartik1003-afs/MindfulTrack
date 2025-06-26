import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useJournalStore from '../store/journalStore';

export default function Journal() {
  const { entries, isLoading, error, deleteEntry, fetchEntries } = useJournalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id);
      fetchEntries();
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.aiFeedback.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = !selectedMood || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const moods = [...new Set(entries.map(entry => entry.mood))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Journal Entries</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredEntries.map((entry) => (
          <div key={entry._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-gray-900 line-clamp-2">{entry.content}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {entry.mood}
                  </span>
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Filter Entries
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="">All Moods</option>
                  {moods.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedMood('');
                    setIsFilterOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn-primary"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Entry Details Dialog */}
      <Dialog
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl rounded bg-white p-6">
            {selectedEntry && (
              <>
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                  Journal Entry Details
                </Dialog.Title>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedEntry.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-900 whitespace-pre-line">
                      {selectedEntry.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {selectedEntry.mood}
                    </span>
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900">AI Analysis</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedEntry.aiFeedback}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="btn-primary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 