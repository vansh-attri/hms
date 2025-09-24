'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import { Button, InputField, Card, Alert } from '@/components/ui/FormElements';

interface LoginFormProps {
  onLogin: (token: string, user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://hms-back-rosy.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store token and user info
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      
      // Call parent callback
      onLogin(data.token, data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');

    } catch {
      // Login error
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Hospital Management System
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to access your account
          </p>
        </div>
        
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
              />
            )}
            
            <InputField
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <InputField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!formData.username || !formData.password}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Dr. Virender Ultrasound and Hospital
          </p>
        </div>
      </div>
    </div>
  );
}