'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileUpIcon, PlusIcon, MinusIcon, UsersIcon } from 'lucide-react';

const avatarPaths = [
  '/avatars/avatar1.jpg',
  '/avatars/avatar2.jpg',
  '/avatars/avatar3.jpg',
  '/avatars/avatar4.jpg',
  '/avatars/avatar5.jpeg',
  '/avatars/avatar6.jpeg',
];

export default function CreateQuiz() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(15);
  const [questionCount, setQuestionCount] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('auto');
  const [step, setStep] = useState(1);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type and size
      if (!selectedFile.type.includes('pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size exceeds 10MB limit');
        return;
      }

      setIsUploading(true);
      setFile(selectedFile);

      // Simulate upload progress
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

  const generateQuizTitle = (filename) => {
    if (!filename) return 'Untitled Quiz';
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitWithFiles = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!file) {
      setError('Please upload a file first');
      return;
    }
  
    try {
      setIsUploading(true);
      const base64 = await fileToBase64(file);
      
      const response = await fetch('http://localhost:5000/api/quiz/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          subject,
          duration,
          questionCount,
        }),
      });
  
      // First check if response is HTML
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE')) {
        throw new Error('Server returned an HTML error page. Check if backend is running properly.');
      }
  
      // Then try to parse as JSON
      const data = JSON.parse(text);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process file');
      }
  
      setQuestions(data.questions);
      setTitle(generateQuizTitle(file.name));
      setStep(2);
    } catch (error) {
      console.error('Error submitting file:', error);
      setError(error.message.includes('<!DOCTYPE') 
        ? 'Backend server error. Please try again later.'
        : error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  const handleSubmitQuiz = () => {
    // Here you would typically send the quiz data to your database
    // For now, we'll just navigate to the lobby with a mock ID
    router.push(`/lobby/${Date.now()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create a New Quiz</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              type="button"
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
              type="button"
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

          <form onSubmit={handleSubmitWithFiles} className="p-6">
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
                      <p className="text-gray-600">Processing... {uploadProgress}%</p>
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
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600">
                          Selected: {file.name}
                        </p>
                      )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <UsersIcon size={18} className="text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option>Public</option>
                    <option>Private (Invite only)</option>
                  </select>
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
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isUploading ? 'Processing...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Review Your Quiz</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Quiz Details:</h3>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
            <p><strong>Questions:</strong> {questions.length}</p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Choose an Avatar</h2>
          <div className="relative flex items-center justify-center mb-6">
            <button
              onClick={() =>
                setAvatarIndex((prev) => (prev === 0 ? avatarPaths.length - 1 : prev - 1))
              }
              className="absolute left-0 p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200"
            >
              &#8592;
            </button>

            <Image
              src={avatarPaths[avatarIndex]}
              alt={`Avatar ${avatarIndex + 1}`}
              width={300}
              height={300}
              className="rounded-full border-4 border-indigo-500 transition-transform duration-300"
            />

            <button
              onClick={() =>
                setAvatarIndex((prev) => (prev === avatarPaths.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-0 p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200"
            >
              &#8594;
            </button>
          </div>

          <div className="text-center text-gray-600 mb-4">
            Selected: Avatar {avatarIndex + 1}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}