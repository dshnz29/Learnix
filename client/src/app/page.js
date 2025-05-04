'use client';

import Image from 'next/image';
import Link from 'next/link';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <div className="mb-4">
        {icon || <div className="w-10 h-10 bg-indigo-200 rounded-full" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">QuizMaster</h1>
          <div className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-800">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Features */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Learn Together, Grow Together
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create and join real-time multiplayer quizzes, track your
              progress, and improve your knowledge with personalized learning
              suggestions.
            </p>
            <div className="mt-8">
              <Link href="/register" className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-md text-lg font-medium hover:bg-indigo-700 transition shadow-md">
                Get Started
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <FeatureCard
              title="Learn Interactively"
              description="Engage with content through interactive quizzes designed to enhance retention and understanding."
            />
            <FeatureCard
              title="Multiplayer Experience"
              description="Compete with friends or join public quizzes to make learning a social and fun experience."
            />
            <FeatureCard
              title="Personalized Learning"
              description="Receive tailored feedback and suggestions based on your quiz performance."
            />
            <FeatureCard
              title="Track Progress"
              description="Monitor your improvement over time with detailed statistics and leaderboards."
            />
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Step 1: Register"
                description="Create an account to get started. It’s quick and easy!"
              />
              <FeatureCard
                title="Step 2: Create or Join Quizzes"
                description="Build your own quizzes or participate in others’ quizzes in real-time."
              />
              <FeatureCard
                title="Step 3: Analyze & Learn"
                description="Get instant feedback and personalized suggestions for improvement."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <p className="text-gray-700 mb-4">
                  “QuizMaster has completely changed how I study! The multiplayer mode keeps me engaged and motivated.”
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">A</div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Anjali Perera</p>
                    <p className="text-gray-500 text-sm">University Student</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <p className="text-gray-700 mb-4">
                  “I love the personalized learning suggestions. It helps me focus exactly where I need improvement.”
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">R</div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Ruwan Silva</p>
                    <p className="text-gray-500 text-sm">High School Teacher</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <p className="text-gray-700 mb-4">
                  “The quiz creation from PDFs is amazing. I created a full practice set for my class in minutes!”
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">D</div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Dilani Fernando</p>
                    <p className="text-gray-500 text-sm">Private Tutor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-indigo-700">Is QuizMaster free to use?</h3>
                <p className="text-gray-600 mt-2">
                  Yes! You can sign up and use all basic features for free. Premium features will be introduced soon.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-indigo-700">Can I create quizzes from PDFs or notes?</h3>
                <p className="text-gray-600 mt-2">
                  Absolutely! You can upload your documents and QuizMaster will generate quizzes for you.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-indigo-700">Is it suitable for schools or tutoring centers?</h3>
                <p className="text-gray-600 mt-2">
                  Definitely! Teachers and tutors can manage students, create quizzes, and track performance over time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2025 QuizMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
