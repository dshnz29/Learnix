import React from 'react';
import Link from 'next/link';
import { SearchIcon, FilterIcon, BookOpenIcon, StarIcon, UsersIcon, ClockIcon } from 'lucide-react';

const ExplorePage = () => {
  const categories = ['Science', 'History', 'Mathematics', 'Geography', 'Literature', 'Arts', 'Technology', 'Sports'];

  const featuredQuizzes = [
    {
      id: 1,
      title: 'World Geography Challenge',
      description: 'Test your knowledge of countries, capitals, and landmarks around the world.',
      image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Geography',
      difficulty: 'Medium',
      participants: 1245,
      rating: 4.8,
      duration: '20 min'
    },
    {
      id: 2,
      title: 'Science & Technology Quiz',
      description: 'Explore the wonders of science and modern technological advancements.',
      image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Science',
      difficulty: 'Hard',
      participants: 982,
      rating: 4.6,
      duration: '30 min'
    },
    {
      id: 3,
      title: 'Historical Figures & Events',
      description: 'Journey through time and test your knowledge of important historical moments.',
      image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'History',
      difficulty: 'Medium',
      participants: 756,
      rating: 4.5,
      duration: '25 min'
    }
  ];

  const popularQuizzes = [
    { id: 4, title: 'Math Brain Teasers', category: 'Mathematics', difficulty: 'Hard', participants: 876, rating: 4.7 },
    { id: 5, title: 'Literary Classics', category: 'Literature', difficulty: 'Medium', participants: 654, rating: 4.4 },
    { id: 6, title: 'Art Through the Ages', category: 'Arts', difficulty: 'Easy', participants: 532, rating: 4.2 },
    { id: 7, title: 'Sports Trivia Challenge', category: 'Sports', difficulty: 'Medium', participants: 987, rating: 4.6 },
    { id: 8, title: 'Tech Innovations Quiz', category: 'Technology', difficulty: 'Hard', participants: 765, rating: 4.8 }
  ];

  return (
    <div className="min-h-screen p-6 text-white font-sans space-y-8 bg-cover">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Explore Quizzes</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-white/50" />
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-white/20 bg-white/10 rounded-md leading-5 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="Search for quizzes by title, topic, or creator"
          />
        </div>
        <button className="px-4 py-2 border border-white/20 rounded-md text-sm text-white bg-white/10 hover:bg-white/20 flex items-center">
          <FilterIcon size={18} className="mr-2" />
          Filters
        </button>
      </div>

      <div className="bg-white/5 border border-white/20 backdrop-blur-md rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button key={category} className="px-4 py-2 bg-white/10 text-white/80 rounded-full hover:bg-white/20">
              {category}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Featured Quizzes</h2>
          <Link href="/explore" className="text-lime-300 hover:text-lime-400 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredQuizzes.map(quiz => (
            <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg">
              <div className="h-40 overflow-hidden">
                <img src={quiz.image} alt={quiz.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 bg-lime-100/10 text-lime-300 text-xs font-medium rounded">
                    {quiz.category}
                  </span>
                  <div className="flex items-center">
                    <StarIcon size={16} className="text-yellow-300" />
                    <span className="ml-1 text-sm font-medium text-white/80">{quiz.rating}</span>
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{quiz.title}</h3>
                <p className="mt-1 text-sm text-white/60">{quiz.description}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-white/70">
                  <div className="flex items-center">
                    <UsersIcon size={16} className="mr-1" />
                    {quiz.participants} played
                  </div>
                  <div className="flex items-center">
                    <ClockIcon size={16} className="mr-1" />
                    {quiz.duration}
                  </div>
                </div>
                <Link href={`/join-quiz`} className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-center hover:bg-indigo-700">
                  Join Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Popular Quizzes</h2>
          <Link href="/explore" className="text-lime-300 hover:text-lime-400 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <ul className="divide-y divide-white/10">
            {popularQuizzes.map(quiz => (
              <li key={quiz.id} className="p-4 sm:p-6 hover:bg-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                    <div className="mt-2 flex items-center flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-300/20 text-indigo-200">
                        {quiz.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
                        {quiz.difficulty}
                      </span>
                      <div className="flex items-center text-sm text-white/70">
                        <StarIcon size={14} className="text-yellow-300 mr-1" />
                        {quiz.rating}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center text-sm text-white/70">
                      <UsersIcon size={16} className="mr-1" />
                      {quiz.participants} played
                    </div>
                    <Link href={`/join-quiz`} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      Join Quiz
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/5 border border-white/20 backdrop-blur-md rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Create Your Own Quiz</h2>
            <p className="text-white/70">Design custom quizzes for your friends, students, or colleagues. Share knowledge in an engaging way!</p>
          </div>
          <Link href="/create-quiz" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-md">
            Create a Quiz
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
