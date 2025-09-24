'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { serviceAPI } from '@/utils/api';

interface ServiceFormData {
  serviceId?: string;
  serviceName: string;
  category: string;
  price: number;
  description: string;
  duration: string; // in minutes
  isActive: boolean;
}

interface ServiceRecord {
  ID: number;
  ServiceName: string;
  Category: string;
  Price: number;
  Description: string;
  Duration: string;
  isActive: boolean;
}

const serviceCategories = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Emergency Care',
  'Surgery',
  'Therapy',
  'Nursing',
  'Consultation',
];

const commonServices = [
  { name: 'General Consultation', category: 'General Medicine', price: 500, duration: '30' },
  { name: 'Cardiac Consultation', category: 'Cardiology', price: 800, duration: '45' },
  { name: 'Pediatric Consultation', category: 'Pediatrics', price: 600, duration: '30' },
  { name: 'Emergency Consultation', category: 'Emergency Care', price: 1000, duration: '60' },
  { name: 'Physiotherapy Session', category: 'Therapy', price: 400, duration: '60' },
  { name: 'Eye Check-up', category: 'Ophthalmology', price: 500, duration: '30' },
  { name: 'Dental Consultation', category: 'ENT', price: 600, duration: '45' },
  { name: 'Skin Consultation', category: 'Dermatology', price: 700, duration: '30' },
  { name: 'Orthopedic Consultation', category: 'Orthopedics', price: 750, duration: '45' },
  { name: 'Gynecology Consultation', category: 'Gynecology', price: 650, duration: '30' },
];

export const ServiceForm: React.FC = () => {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: '',
    category: '',
    price: 0,
    description: '',
    duration: '',
    isActive: true,
  });

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const services = await serviceAPI.getAll();
      // Convert API response to local format
      const serviceRecords: ServiceRecord[] = services.map(service => ({
        ID: service.id,
        ServiceName: service.name,
        Category: 'General', // Default category since API doesn't have category
        Price: service.price || 0,
        Description: service.description || '',
        Duration: '30', // Default duration since API doesn't have duration
        isActive: service.isActive !== false
      }));
      setServices(serviceRecords);
    } catch {
      // Failed to load services
      setMessage('Failed to load services');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleServiceSelect = (service: ServiceRecord, index: number) => {
    setFormData({
      serviceId: String(service.ID),
      serviceName: service.ServiceName,
      category: service.Category,
      price: service.Price,
      description: service.Description,
      duration: service.Duration,
      isActive: service.isActive,
    });
    setSelectedServiceIndex(index);
    setMessage('');
  };

  const handleQuickAdd = (service: typeof commonServices[0]) => {
    setFormData(prev => ({
      ...prev,
      serviceName: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      isActive: true,
    }));
    setSelectedServiceIndex(-1);
  };

  const handleClear = () => {
    setFormData({
      serviceName: '',
      category: '',
      price: 0,
      description: '',
      duration: '',
      isActive: true,
    });
    setSelectedServiceIndex(-1);
    setMessage('');
  };

  const handleSave = async () => {
    if (!formData.serviceName.trim()) {
      setMessage('Service name is required');
      return;
    }

    if (!formData.category.trim()) {
      setMessage('Category is required');
      return;
    }

    if (formData.price <= 0) {
      setMessage('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const serviceData = {
        name: formData.serviceName,
        description: formData.description,
        price: formData.price,
        isActive: formData.isActive
      };

      if (formData.serviceId) {
        // Update existing service
        await serviceAPI.update(formData.serviceId, serviceData);
        setMessage('Service updated successfully!');
      } else {
        // Create new service
        const created = await serviceAPI.create(serviceData);
        setFormData(prev => ({ ...prev, serviceId: String(created.id) }));
        setMessage('Service added successfully!');
      }

      // Reload services list
      await loadServices();
      
      // Reset form
      handleClear();
    } catch {
      // Save failed
      setMessage('Error saving service data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.serviceId) return;

    if (!window.confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    try {
      await serviceAPI.delete(formData.serviceId);
      setMessage('Service deleted successfully!');
      
      // Reload services list
      await loadServices();
      
      handleClear();
    } catch {
      // Delete failed
      setMessage('Error deleting service');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.ServiceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || service.Category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🏥</span>
          Service Management
        </h2>
        <p className="mt-2 text-indigo-100">Add, edit, and manage medical services and consultations</p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-8 p-6">
          {/* Left side - Service Form */}
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
                  {formData.serviceId ? '✏️' : '➕'}
                </span>
                {formData.serviceId ? 'Edit Service' : 'Add New Service'}
              </h3>
              
              {/* Quick Add Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Common Services</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {commonServices.map((service, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAdd(service)}
                      className="text-left p-2 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-xs"
                    >
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-gray-500">₹{service.price} • {service.duration} min • {service.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Select Category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Duration"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter service description"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-3 mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="leading-relaxed">
                      Service is active and available for booking
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium rounded-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      formData.serviceId ? 'Update Service' : 'Add Service'
                    )}
                  </Button>
                  
                  {formData.serviceId && (
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 font-medium rounded-lg"
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleClear}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 font-medium rounded-lg"
                >
                  Clear Form
                </Button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium text-sm ${
                      message.includes('success')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Services List */}
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Search Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Services</h3>
                  <span className="text-sm text-gray-500">
                    {filteredServices.length} of {services.length} services
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Search services by name..."
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">All Categories</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-indigo-50 p-3 text-sm font-medium text-indigo-800 border-b border-indigo-200">
                <div className="col-span-1">►</div>
                <div className="col-span-4">Service Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-1 text-center">Status</div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-y-auto">
                {filteredServices.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery || filterCategory ? 'No services found matching your filters.' : 'No services found. Add your first service using the form.'}
                  </div>
                ) : (
                  filteredServices.map((service, index) => {
                    const isSelected = selectedServiceIndex === index;
                    const rowClasses = `grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-100 border-indigo-300' : ''
                    }`;
                    
                    return (
                      <div
                        key={service.ID}
                        className={rowClasses}
                        onClick={() => handleServiceSelect(service, index)}
                      >
                        <div className="col-span-1 text-indigo-600 font-medium">
                          {isSelected ? '►' : ''}
                        </div>
                        <div className="col-span-4 font-medium text-gray-900">
                          {service.ServiceName}
                        </div>
                        <div className="col-span-2 text-gray-600">
                          {service.Category}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          ₹{service.Price}
                        </div>
                        <div className="col-span-2 text-gray-600">
                          {service.Duration} min
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
                <span>
                  Total: {services.length} services
                </span>
                <span>
                  Active: {services.filter(s => s.isActive).length} | 
                  Inactive: {services.filter(s => !s.isActive).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};