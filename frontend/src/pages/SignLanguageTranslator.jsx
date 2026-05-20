import React from 'react';

const SignLanguageTranslator = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sign Language Translator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time hand gesture recognition system. Make sure the local processing server is running.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="aspect-w-16 aspect-h-9" style={{ minHeight: '800px' }}>
            <iframe
              src="https://mt-new-bwdmgcm6wqyfjpubktucwv.streamlit.app/?embed=true"
              title="Sign Language Model"
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: '800px' }}
              allow="camera; microphone"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;
