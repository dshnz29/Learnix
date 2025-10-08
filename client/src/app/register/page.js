'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Building,
  AtSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    institution: '',
    avatar: 0,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const { signup, loginWithGoogle, user, checkUsernameAvailability } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.jpg',
    '/avatars/avatar5.jpeg',
    '/avatars/avatar6.jpeg'
  ];

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Add validation for username and email since they're now in Step 1
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // Step 2 now only has institution (optional), so no validation needed
    // But we can add basic validation if needed
    const newErrors = {};
    
    // Institution is optional, so no validation required
    // You could add validation here if you want to make it required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep4()) return;

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const result = await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
        institution: formData.institution,
        avatar: formData.avatar
      });

      setMessage({ type: 'success', content: result.message });
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const result = await loginWithGoogle();
      setMessage({ type: 'success', content: result.message });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      let errorMessage = 'Google signup failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Signup cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setMessage({ type: 'error', content: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Account Details';
      case 3: return 'Security Setup';
      case 4: return 'Final Steps';
      default: return 'Create Account';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#422cac] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link
            href="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Register Form - Two Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden h-[600px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            
            {/* Left Column - Branding & Info */}
            <div className="bg-gradient-to-br from-[#18DEA3]/20 to-[#422cac]/20 p-8 flex flex-col justify-center">
              <div className="text-center lg:text-left">
                {/* Logo */}
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">LearniX</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Join the Learning Revolution
                </h1>
                <p className="text-white/80 text-base mb-8">
                  Connect with thousands of learners worldwide and unlock your potential with our interactive learning platform.
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#18DEA3]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-[#18DEA3]" />
                    </div>
                    <span className="text-white/90 text-sm">Interactive quizzes and assessments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#18DEA3]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-[#18DEA3]" />
                    </div>
                    <span className="text-white/90 text-sm">Personalized learning paths</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#18DEA3]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-[#18DEA3]" />
                    </div>
                    <span className="text-white/90 text-sm">Real-time progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#18DEA3]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-[#18DEA3]" />
                    </div>
                    <span className="text-white/90 text-sm">Community of learners and educators</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Registration Form */}
            <div className="p-8 flex flex-col justify-center">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white/70 text-sm">{getStepTitle()}</p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">Step {currentStep} of 4</span>
                  <span className="text-xs text-white/60">{Math.round((currentStep / 4) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Message Display */}
              {message.content && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border-green-400/30 text-green-400'
                      : 'bg-red-500/10 border-red-400/30 text-red-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <span className="text-xs">{message.content}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                              errors.firstName
                                ? 'border-red-400/50 focus:ring-red-400/20'
                                : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                            }`}
                            placeholder="John"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                              errors.lastName
                                ? 'border-red-400/50 focus:ring-red-400/20'
                                : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                            }`}
                            placeholder="Doe"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                      <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <AtSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                            errors.username
                              ? 'border-red-400/50 focus:ring-red-400/20'
                              : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                          }`}
                          placeholder="johndoe123"
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.username}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                            errors.email
                              ? 'border-red-400/50 focus:ring-red-400/20'
                              : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Account Details */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Username */}
                    

                    {/* Institution (Optional) */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Institution (Optional)
                      </label>
                      <div className="relative">
                        <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50 transition-colors"
                          placeholder="Your school or university"
                        />
                      </div>
                    </div>

                    {/* Google Signup Option */}
                    <div className="pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FcGoogle size={20} />
                        <span>Or continue with Google</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Security Setup */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Password */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                            errors.password
                              ? 'border-red-400/50 focus:ring-red-400/20'
                              : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                          }`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                            errors.confirmPassword
                              ? 'border-red-400/50 focus:ring-red-400/20'
                              : 'border-white/20 focus:ring-[#18DEA3]/20 focus:border-[#18DEA3]/50'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Password Requirements */}
                    {/* <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-white/80 text-sm font-medium mb-2">Password Requirements:</h4>
                      <ul className="text-white/60 text-xs space-y-1">
                        <li className={`flex items-center gap-2 ${formData.password.length >= 6 ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-400' : 'bg-white/30'}`}></div>
                          At least 6 characters
                        </li>
                        <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                          One uppercase letter
                        </li>
                        <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                          One lowercase letter
                        </li>
                        <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                          One number
                        </li>
                      </ul>
                    </div> */}
                  </motion.div>
                )}

                {/* Step 4: Final Steps */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Avatar Selection */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Choose Your Avatar
                      </label>
                      <div className="grid grid-cols-6 gap-3">
                        {avatars.map((avatar, index) => (
                          <label
                            key={index}
                            className={`cursor-pointer relative ${
                              formData.avatar === index ? 'ring-3 ring-[#18DEA3]/50' : ''
                            } rounded-full overflow-hidden transition-all hover:scale-105`}
                          >
                            <input
                              type="radio"
                              name="avatar"
                              value={index}
                              checked={formData.avatar === index}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <Image
                              src={avatar}
                              alt={`Avatar ${index + 1}`}
                              width={50}
                              height={50}
                              className="rounded-full w-12 h-12 object-cover"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 text-[#18DEA3] border-white/20 rounded focus:ring-[#18DEA3] focus:ring-2"
                        />
                        <span className="text-sm text-white/80">
                          I agree to the{' '}
                          <a href="#" className="text-[#18DEA3] hover:text-[#18DEA3]/80 underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-[#18DEA3] hover:text-[#18DEA3]/80 underline">Privacy Policy</a>
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>

                    {/* Account Summary */}
                    {/* <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-white/80 text-sm font-medium mb-3">Account Summary:</h4>
                      <div className="space-y-2 text-xs text-white/60">
                        <div>Name: <span className="text-white">{formData.firstName} {formData.lastName}</span></div>
                        <div>Username: <span className="text-white">@{formData.username}</span></div>
                        <div>Email: <span className="text-white">{formData.email}</span></div>
                        <div>Role: <span className="text-white capitalize">{formData.role}</span></div>
                        {formData.institution && (
                          <div>Institution: <span className="text-white">{formData.institution}</span></div>
                        )}
                      </div>
                    </div> */}
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-3 border border-white/30 rounded-lg font-semibold text-white hover:bg-white/10 transition-all duration-300"
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-[#18DEA3] to-[#422cac] py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-300"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#18DEA3] to-[#422cac] py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-[#18DEA3] hover:text-[#18DEA3]/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
