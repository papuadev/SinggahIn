import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between">
        <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">SinggahIn</h1>
            <span className="text-sm text-gray-500">Property Renting App</span>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6">
          <Routes>
            <Route
              path="/"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang di SinggahIn</h2>
                  <p className="text-gray-600">Platform sewa properti, villa, hotel, apartemen, dan guesthouse terpercaya.</p>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SinggahIn. Hak cipta dilindungi.
        </footer>
      </div>
    </BrowserRouter>
  );
}
