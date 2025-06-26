import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">MindfulTrack</h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to <span className="font-semibold text-primary-500">MindfulTrack</span> – your personal mental health companion. Log your moods and journal entries, gain AI-powered insights, and track your emotional well-being over time with beautiful, interactive dashboards.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/login">
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition">Login</button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 bg-white border border-primary-600 text-primary-600 rounded-lg font-semibold shadow hover:bg-primary-50 transition">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
} 