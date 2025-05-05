import React from 'react';
import Link from 'next/link';
import { SearchIcon, FilterIcon, BookOpenIcon, StarIcon, UsersIcon, ClockIcon } from 'lucide-react';
const ExplorePage = () => {
  // Mock categories data
  const categories = ['Science', 'History', 'Mathematics', 'Geography', 'Literature', 'Arts', 'Technology', 'Sports'];
  // Mock featured quizzes data
  const featuredQuizzes = [{
    id: 1,
    title: 'World Geography Challenge',
    description: 'Test your knowledge of countries, capitals, and landmarks around the world.',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Geography',
    difficulty: 'Medium',
    participants: 1245,
    rating: 4.8,
    duration: '20 min'
  }, {
    id: 2,
    title: 'Science & Technology Quiz',
    description: 'Explore the wonders of science and modern technological advancements.',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Science',
    difficulty: 'Hard',
    participants: 982,
    rating: 4.6,
    duration: '30 min'
  }, {
    id: 3,
    title: 'Historical Figures & Events',
    description: 'Journey through time and test your knowledge of important historical moments.',
    image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'History',
    difficulty: 'Medium',
    participants: 756,
    rating: 4.5,
    duration: '25 min'
  }];
  // Mock popular quizzes data
  const popularQuizzes = [{
    id: 4,
    title: 'Math Brain Teasers',
    category: 'Mathematics',
    difficulty: 'Hard',
    participants: 876,
    rating: 4.7
  }, {
    id: 5,
    title: 'Literary Classics',
    category: 'Literature',
    difficulty: 'Medium',
    participants: 654,
    rating: 4.4
  }, {
    id: 6,
    title: 'Art Through the Ages',
    category: 'Arts',
    difficulty: 'Easy',
    participants: 532,
    rating: 4.2
  }, {
    id: 7,
    title: 'Sports Trivia Challenge',
    category: 'Sports',
    difficulty: 'Medium',
    participants: 987,
    rating: 4.6
  }, {
    id: 8,
    title: 'Tech Innovations Quiz',
    category: 'Technology',
    difficulty: 'Hard',
    participants: 765,
    rating: 4.8
  }];
  return <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Explore Quizzes</h1>
      </header>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input type="search" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search for quizzes by title, topic, or creator" />
        </div>
        <div>
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FilterIcon size={18} className="mr-2" />
            Filters
          </button>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(category => <button key={category} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200">
              {category}
            </button>)}
        </div>
      </div>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900">
            Featured Quizzes
          </h2>
          <Link href="/explore" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredQuizzes.map(quiz => <div key={quiz.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
              <div className="h-40 overflow-hidden">
                <img src={quiz.image} alt={quiz.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                      {quiz.category}
                    </span>
                    <div className="flex items-center">
                      <StarIcon size={16} className="text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700">
                        {quiz.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {quiz.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon size={16} className="mr-1" />
                    {quiz.participants} played
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon size={16} className="mr-1" />
                    {quiz.duration}
                  </div>
                </div>
                <Link href={`/join-quiz`} className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-center hover:bg-indigo-700">
                  Join Quiz
                </Link>
              </div>
            </div>)}
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-900">Popular Quizzes</h2>
          <Link href="/explore" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {popularQuizzes.map(quiz => <li key={quiz.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {quiz.title}
                    </h3>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {quiz.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {quiz.difficulty}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <StarIcon size={14} className="text-yellow-400 mr-1" />
                        {quiz.rating}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end sm:space-x-4">
                    <div className="flex items-center text-sm text-gray-500 sm:mr-4">
                      <UsersIcon size={16} className="mr-1" />
                      {quiz.participants} played
                    </div>
                    <Link href={`/join-quiz`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Join Quiz
                    </Link>
                  </div>
                </div>
              </li>)}
          </ul>
        </div>
      </section>
      <section className="bg-indigo-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-6">
            <h2 className="text-xl font-bold text-indigo-900 mb-2">
              Create Your Own Quiz
            </h2>
            <p className="text-indigo-700">
              Design custom quizzes for your friends, students, or colleagues.
              Share knowledge in an engaging way!
            </p>
          </div>
          <Link href="/create-quiz" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-md">
            Create a Quiz
          </Link>
        </div>
      </section>
    </div>;
};
export default ExplorePage;