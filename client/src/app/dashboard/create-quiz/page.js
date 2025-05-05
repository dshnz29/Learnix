'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpIcon, PlusIcon, MinusIcon } from 'lucide-react';
import avatar1 from '@/public/avatars/avatar1.png';
import avatar2 from '@/public/avatars/avatar2.png';
import avatar3 from '@/public/avatars/avatar3.png';
import avatar4 from '@/public/avatars/avatar4.png';
import avatar5 from '@/public/avatars/avatar5.png';
import avatar6 from '@/public/avatars/avatar6.png';


export default function CreateQuiz() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(15);
  const [questionCount, setQuestionCount] = useState(10);
  const [avatar, setAvatar] = useState('default');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('auto');
  const [step, setStep] = useState(1); // step 1 = quiz form, step 2 = avatar selection
  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];
    const [avatarIndex, setAvatarIndex] = useState(0);


  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
        }
      }, 300);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2); // Move to avatar selection step
  };

  const handleSubmitQuiz = () => {
    // Add avatar logic here if needed
    router.push('/lobby/new-quiz-123');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create a New Quiz</h1>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 font-medium text-center ${
                activeTab === 'auto'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('auto')}
            >
              AI-Generated Questions
            </button>
            <button
              className={`flex-1 py-4 font-medium text-center ${
                activeTab === 'manual'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('manual')}
            >
              Manual Questions
            </button>
          </div>

          <form onSubmit={handleNext} className="p-6">
            {activeTab === 'auto' && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Upload PDF Material</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {isUploading ? (
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-600">Uploading... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <FileUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop a PDF file, or{' '}
                        <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">PDF files up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., World Geography"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-gray-700 mb-2 font-medium">
                  Duration (minutes)
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setDuration(Math.max(5, duration - 5))}
                    className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                    className="w-full text-center px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="5"
                    max="60"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setDuration(Math.min(60, duration + 5))}
                    className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="questionCount" className="block text-gray-700 mb-2 font-medium">
                Number of Questions
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  id="questionCount"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                  className="w-full text-center px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="5"
                  max="50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setQuestionCount(Math.min(50, questionCount + 5))}
                  className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

        {step === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Choose an Avatar</h2>

            <div className="relative flex items-center justify-center mb-6">
            <button
                onClick={() => setAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1))}
                className="absolute left-0 p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200"
            >
                &#8592;
            </button>

            <img
                src={avatars[avatarIndex].src}
                alt={`Avatar ${avatarIndex + 1}`}
                className="w-32 h-32 rounded-full border-4 border-indigo-500 transition-transform duration-300"
            />

            <button
                onClick={() => setAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1))}
                className="absolute right-0 p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200"
            >
                &#8594;
            </button>
            </div>

            <div className="text-center text-gray-600 mb-4">Selected: Avatar {avatarIndex + 1}</div>

            <div className="flex justify-end">
            <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Create Quiz
            </button>
            </div>
        </div>
        )}

    </div>
  );
}
