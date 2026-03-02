'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hms-back-rosy.vercel.app/api';

interface Setting {
  value: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

interface Settings {
  [key: string]: Setting;
}

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Editable values
  const [maxDiscountPercent, setMaxDiscountPercent] = useState('30');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchSettings();
  }, [isAuthenticated, user, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      
      // Set form values from fetched settings
      if (data.MAX_DISCOUNT_REFERRAL_PERCENT) {
        setMaxDiscountPercent(data.MAX_DISCOUNT_REFERRAL_PERCENT.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const percent = Number(maxDiscountPercent);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        setMessage({ type: 'error', text: 'Percentage must be between 0 and 100' });
        setSaving(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/settings/MAX_DISCOUNT_REFERRAL_PERCENT`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: maxDiscountPercent,
          updatedBy: user?.username || 'admin'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update setting');
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      fetchSettings(); // Refresh
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Configure system-wide settings</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Receipt Settings</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Max Discount + Referral Percentage */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Maximum Discount + Referral Percentage
              </label>
              <p className="text-sm text-gray-500">
                The combined discount and referral amount cannot exceed this percentage of the total bill amount.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  value={maxDiscountPercent}
                  onChange={(e) => setMaxDiscountPercent(e.target.value)}
                  min="0"
                  max="100"
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <span className="text-gray-600 font-medium">%</span>
              </div>
              {settings.MAX_DISCOUNT_REFERRAL_PERCENT && (
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {new Date(settings.MAX_DISCOUNT_REFERRAL_PERCENT.updatedAt).toLocaleString()} 
                  {settings.MAX_DISCOUNT_REFERRAL_PERCENT.updatedBy && ` by ${settings.MAX_DISCOUNT_REFERRAL_PERCENT.updatedBy}`}
                </p>
              )}
            </div>

            {/* Example */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> If set to {maxDiscountPercent}% and bill total is ₹1,000, 
                the maximum combined discount + referral amount allowed would be ₹{(1000 * Number(maxDiscountPercent) / 100).toFixed(0)}.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
