'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleLoginClick = () => {
    router.push('/dashboard');
  };

  const services = [
    {
      name: `Pregnancy: Routine`,
      price: `3400`,
      category: "Pregnancy",
      icon: "👶"
    },
    {
      name: `Pregnancy: Early Morphology`,
      price: `4000`,
      category: "Pregnancy",
      icon: "👶"
    },
    {
      name: `Pregnancy: Anomalies Scan`,
      price: `4250`,
      category: "Pregnancy",
      icon: "👶"
    },
    {
      name: `Pregnancy: Doppler`,
      price: `4000`,
      category: "Pregnancy",
      icon: "👶"
    },
    {
      name: `Pregnancy: Fetal Echocardiography`,
      price: `4500`,
      category: "Pregnancy",
      icon: "❤️"
    },
    {
      name: `Pregnancy: Non-Stress Test`,
      price: `4750`,
      category: "Pregnancy",
      icon: "👶"
    },
    {
      name: `Pregnancy: 3D/ 4D`,
      price: `5000`,
      category: "Pregnancy",
      icon: "🎯"
    },
    {
      name: `Pregnancy: 3D/ 4D with Fetal Echocardiography`,
      price: `5500`,
      category: "Pregnancy",
      icon: "🎯"
    },
    {
      name: `Ovulation: One Sitting`,
      price: `1250`,
      category: "Gynecology",
      icon: "�"
    },
    {
      name: `Ovulation: Whole Cycle`,
      price: `3500`,
      category: "Gynecology",
      icon: "🔬"
    },
    {
      name: `Pelvis (Lower Abdomen)`,
      price: `2000`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Transvaginal Ultrasound (TVS)`,
      price: `3750`,
      category: "Gynecology",
      icon: "🔬"
    },
    {
      name: `Kidneys & TVS`,
      price: `3750`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Breast`,
      price: `3000`,
      category: "Small Parts",
      icon: "🩺"
    },
    {
      name: `Thyroid/ Cranium`,
      price: `2500`,
      category: "Small Parts",
      icon: "🩺"
    },
    {
      name: `Scrotum & Varicocele`,
      price: `2750`,
      category: "Small Parts",
      icon: "🩺"
    },
    {
      name: `Carotid Doppler`,
      price: `2750`,
      category: "Doppler",
      icon: "💓"
    },
    {
      name: `FNAC/ Aspiration`,
      price: `3500`,
      category: "Procedures",
      icon: "💉"
    },
    {
      name: `CVS (Ultrasound + Disposables)`,
      price: `4000`,
      category: "Procedures",
      icon: "�"
    },
    {
      name: `Kidneys & Pelvis`,
      price: `2250`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Upper Abdomen`,
      price: `1900`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Abdomen (Upper Abdomen + Urinary Bladder)`,
      price: `2000`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Abdomen & Pelvis (Transabdominal)`,
      price: `2400`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Kidneys & Urinary Bladder`,
      price: `1900`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Kidneys, Urinary Bladder & Prostate`,
      price: `2000`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Transrectal Ultrasound (TRUS)`,
      price: `3250`,
      category: "Specialized",
      icon: "🔍"
    },
    {
      name: `Kidneys & Suprarenals`,
      price: `1750`,
      category: "General",
      icon: "🏥"
    },
    {
      name: `Pleura`,
      price: `1600`,
      category: "General",
      icon: "🏥"
    }
  ];

  const features = [
    {
      title: "State-of-the-Art Technology",
      description: "We use advanced ultrasound equipment with COLOR 3D, 4D WITH 5D FEATURES for clear and accurate imaging",
      icon: "�️"
    },
    {
      title: "Expert Care",
      description: "Led by Dr. Virender and a team of skilled radiologists and sonologists, we offer expertise you can trust",
      icon: "👨‍⚕️"
    },
    {
      title: "Patient-Centric Approach", 
      description: "Your comfort and care are our top priorities with comprehensive diagnostic solutions",
      icon: "❤️"
    },
    {
      title: "Comprehensive Services",
      description: "From routine scans to specialized diagnostics including Fibroscan, Fetal Echo, and Level II scans",
      icon: "🔬"
    }
  ];

  const testimonials = [
    {
      text: "Really Good Place for Colour Ultrasound. Spacious clean cozy Environment",
      author: "Asha Rawat Dev Rawat",
      role: "Patient"
    },
    {
      text: "Well mannered gentleman with decent skill set & knowledge. Highly recommended for ultrasonography !!!",
      author: "Himanshu Arora",
      role: "Patient"
    },
    {
      text: "Color Ultrasound Centre with No waiting Period. Well Managed.",
      author: "Yogesh Maholya",
      role: "Patient"
    },
    {
      text: "It's very nice hospital, The staff is also managing or supporting .",
      author: "Sumit Sorout",
      role: "Patient"
    },
    {
      text: "Super ultrasound centre. Very good staff and doctor.",
      author: "Mahesh Baghel",
      role: "Patient"
    }
  ];

  // Auto-advance testimonials
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  // Contact form handlers
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      const response = await fetch('https://formspree.io/f/xblrjyga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
        }),
      });

      if (response.ok) {
        setFormMessage('Thank you for your message! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setFormMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setFormSubmitting(false);
      // Clear message after 5 seconds
      setTimeout(() => setFormMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Siddhivinayak Ultrasound Centre" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="ml-3 text-xl font-bold text-gray-800">
                Siddhivinayak Ultrasound Centre
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</a>
                <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact Us</a>
                <button
                  onClick={() => router.push('/refer-patient')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Refer a Patient
                </button>
                <button
                  onClick={handleLoginClick}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Dr.Virender Ultrasound Centre Home</a>
                <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-blue-600">About Us</a>
                <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Services</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Testimonials</a>
                <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Contact Us</a>
                <button
                  onClick={() => router.push('/refer-patient')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Refer a Patient
                </button>
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Admin Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                Welcome to{' '}
                <span className="text-blue-600">Siddhivinayak</span>{' '}
                <span className="text-indigo-600">Ultrasound Centre</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your trusted destination for advanced healthcare management 
                and comprehensive diagnostic solutions with compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#services"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-colors text-center"
                >
                  Our Services
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Image 
                    src="/logo.png" 
                    alt="Siddhivinayak Ultrasound Centre" 
                    width={200} 
                    height={200}
                    className="rounded-full bg-white p-4"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚕️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Dr. Virender Ultrasound Centre is a trusted diagnostic center offering the best ultrasound, color Doppler, and specialized scans. 
              Led by Dr. Virender, our expert radiologists and sonologists use advanced ultrasound equipment for precise imaging. 
              We prioritize patient comfort, delivering a comprehensive, patient-centric approach for accurate diagnostics you can rely on.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Our Specialized Diagnostic Services</h3>
              <p className="text-lg opacity-90 max-w-4xl mx-auto mb-6">
                Experience comprehensive ultrasound imaging with our state-of-the-art technology and expert medical professionals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-300">🔬 Advanced Imaging</h4>
                <ul className="space-y-1 opacity-90">
                  <li>• COLOR 3D, 4D WITH 5D FEATURES</li>
                  <li>• Fibroscan & Fat Quantification</li>
                  <li>• 5D CNS, Heart & Follicles</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-300">👶 Fetal & Pregnancy</h4>
                <ul className="space-y-1 opacity-90">
                  <li>• Fetal Echocardiography</li>
                  <li>• NT/NB Scan (Level I)</li>
                  <li>• Level II Anomaly Scan</li>
                  <li>• Neurosonogram</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-300">🩺 Specialized Scans</h4>
                <ul className="space-y-1 opacity-90">
                  <li>• Small Parts (Breast, Scrotum)</li>
                  <li>• TVS, Neck & Thyroid</li>
                  <li>• Doppler Studies</li>
                  <li>• General Ultrasound</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm opacity-75">Book appointments for Level II, Doppler Studies, and specialized diagnostics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Achievements</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional memberships and certifications that demonstrate our commitment to excellence in fetal medicine and diagnostic imaging
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Fetal Medicine Foundation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Member of The Fetal Medicine Foundation
                </h3>
                
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <Image 
                      src="/fetal.png" 
                      alt="The Fetal Medicine Foundation" 
                      width={200} 
                      height={120}
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Recognized member of The Fetal Medicine Foundation, ensuring expertise in advanced fetal 
                  diagnostic techniques and adherence to international standards in prenatal care.
                </p>
                
                <a 
                  href="https://fetalmedicine.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Know more
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Society of Fetal Medicine */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Member of SOCIETY OF FETAL MEDICINE
                </h3>
                
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <Image 
                      src="/society.png" 
                      alt="Society of Fetal Medicine" 
                      width={200} 
                      height={120}
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Active member of the Society of Fetal Medicine, committed to advancing fetal medicine 
                  research, education, and clinical practice for optimal maternal and fetal outcomes.
                </p>
                
                <a 
                  href="https://www.societyoffetalmedicine.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Know more
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">
              Complete range of ultrasound and diagnostic imaging services with transparent pricing and expert care
            </p>
          </div>

          {/* Service Categories */}
          <div className="mb-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Pregnancy Services */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👶</div>
                  <h3 className="text-xl font-bold text-pink-800 mb-2">Pregnancy & Fetal</h3>
                </div>
                <div className="space-y-3">
                  {services.filter(s => s.category === 'Pregnancy').slice(0, 4).map((service, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                        </div>
                        <span className="text-pink-600 font-bold text-sm">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <span className="text-xs text-pink-600">+{services.filter(s => s.category === 'Pregnancy').length - 4} more services</span>
                  </div>
                </div>
              </div>

              {/* Gynecology Services */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🔬</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Gynecology</h3>
                </div>
                <div className="space-y-3">
                  {services.filter(s => s.category === 'Gynecology').map((service, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                        </div>
                        <span className="text-purple-600 font-bold text-sm">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Small Parts */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🩺</div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Small Parts</h3>
                </div>
                <div className="space-y-3">
                  {services.filter(s => s.category === 'Small Parts').map((service, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                        </div>
                        <span className="text-blue-600 font-bold text-sm">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Ultrasound */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🏥</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">General Ultrasound</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {services.filter(s => s.category === 'General').map((service, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                        </div>
                        <span className="text-green-600 font-bold text-sm">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Doppler Studies */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">💓</div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Doppler Studies</h3>
              </div>
              <div className="space-y-3">
                {services.filter(s => s.category === 'Doppler').map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                      </div>
                      <span className="text-red-600 font-bold text-sm">₹{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Procedures */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">💉</div>
                <h3 className="text-xl font-bold text-orange-800 mb-2">Procedures</h3>
              </div>
              <div className="space-y-3">
                {services.filter(s => s.category === 'Procedures').map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                      </div>
                      <span className="text-orange-600 font-bold text-sm">₹{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialized */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔍</div>
                <h3 className="text-xl font-bold text-indigo-800 mb-2">Specialized</h3>
              </div>
              <div className="space-y-3">
                {services.filter(s => s.category === 'Specialized').map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                      </div>
                      <span className="text-indigo-600 font-bold text-sm">₹{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Book Appointment CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Book Your Appointment Today</h3>
            <p className="text-lg opacity-90 mb-6">Expert ultrasound services with transparent pricing and advanced technology</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+919896416790" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>📞</span>
                Call (+91) 9896416790
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600">
              Real reviews from patients who experienced our ultrasound services and expert care
            </p>
          </div>

          {/* Testimonials Slideshow */}
          <div className="relative max-w-4xl mx-auto">
            {/* Main Testimonial Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-2xl border border-blue-100 text-center min-h-[300px] flex flex-col justify-center">
              <div className="text-yellow-400 text-3xl mb-6">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              
              <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8 font-medium">
                &ldquo;{testimonials[currentTestimonial].text}&rdquo;
              </blockquote>
              
              <div className="border-t border-blue-200 pt-6">
                <p className="text-xl font-bold text-gray-800 mb-2">{testimonials[currentTestimonial].author}</p>
                <p className="text-blue-600 font-medium">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-blue-600 hover:text-blue-800"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-blue-600 hover:text-blue-800"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 hover:bg-blue-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 bg-gray-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-5000 ease-linear"
                style={{width: `${((currentTestimonial + 1) / testimonials.length) * 100}%`}}
              />
            </div>

            {/* Testimonial Counter */}
            <div className="text-center mt-4 text-gray-500 text-sm">
              {currentTestimonial + 1} of {testimonials.length} reviews
            </div>
          </div>

          
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-medium text-lg mb-2">Contact Us</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">GET IN TOUCH WITH US</h2>
            <p className="text-xl text-gray-600">
              Ready to schedule an appointment or have questions? We&apos;re here to help!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Location</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Punhana mode, opp. Tehsil compound,<br />
                    Palwal, Hodal, Haryana, 121106
                  </p>
                  <a 
                    href="https://www.google.com/maps/place/DR.VIRENDER+ULTRASOUND+CENTRE/@27.9032685,77.3645594,17z/data=!3m1!4b1!4m6!3m5!1s0x39732d2bb765c6f5:0x7a313507b8813333!8m2!3d27.9032685!4d77.3645594!16s%2Fg%2F11fmd7qxkn" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mt-2 text-sm font-medium"
                  >
                    View on Google Maps
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Phone Number</h3>
                  <p className="text-gray-600 mb-2">(+91) 9896416790</p>
                  <a 
                    href="tel:+919896416790" 
                    className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Call Now
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Address</h3>
                  <p className="text-gray-600 mb-2 break-all">drvirenderultrasoundcentre@gmail.com</p>
                  <a 
                    href="mailto:drvirenderultrasoundcentre@gmail.com" 
                    className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Send Email
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <form onSubmit={handleContactFormSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    placeholder="Your Email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactFormChange}
                    placeholder="Your Phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    placeholder="Your Message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors resize-vertical"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    formSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  } text-white`}
                >
                  {formSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {formMessage && (
                  <div className={`p-4 rounded-lg text-sm ${
                    formMessage.includes('Thank you') 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {formMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image 
                src="/logo.png" 
                alt="Siddhivinayak Ultrasound Centre" 
                width={32} 
                height={32}
                className="rounded"
              />
              <span className="ml-3 text-lg font-semibold">
                Siddhivinayak Ultrasound Centre
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6 mb-4 md:mb-0 text-sm">
              <a href="#home" className="hover:text-gray-300 transition-colors">Home</a>
              <a href="#about" className="hover:text-gray-300 transition-colors">About Us</a>
              <a href="#services" className="hover:text-gray-300 transition-colors">Services</a>
              <a href="#testimonials" className="hover:text-gray-300 transition-colors">Testimonials</a>
              <a href="#refer-patient" className="hover:text-gray-300 transition-colors">Refer a Patient</a>
              <a href="#contact" className="hover:text-gray-300 transition-colors">Contact Us</a>
            </div>
            
            <p className="text-gray-400 text-sm">
              © 2024 Siddhivinayak Ultrasound Centre. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}