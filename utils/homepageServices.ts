// Default services data for the homepage
// This can be modified via the admin panel and stored in localStorage

export interface HomepageService {
  id: string;
  name: string;
  price: string;
  category: string;
  icon: string;
}

export const defaultServices: HomepageService[] = [
  {
    id: "1",
    name: "Pregnancy: Routine",
    price: "3400",
    category: "Pregnancy",
    icon: "👶"
  },
  {
    id: "2",
    name: "Pregnancy: Early Morphology",
    price: "4000",
    category: "Pregnancy",
    icon: "👶"
  },
  {
    id: "3",
    name: "Pregnancy: Anomalies Scan",
    price: "4250",
    category: "Pregnancy",
    icon: "👶"
  },
  {
    id: "4",
    name: "Pregnancy: Doppler",
    price: "4000",
    category: "Pregnancy",
    icon: "👶"
  },
  {
    id: "5",
    name: "Pregnancy: Fetal Echocardiography",
    price: "4500",
    category: "Pregnancy",
    icon: "❤️"
  },
  {
    id: "6",
    name: "Pregnancy: Non-Stress Test",
    price: "4750",
    category: "Pregnancy",
    icon: "👶"
  },
  {
    id: "7",
    name: "Pregnancy: 3D/ 4D",
    price: "5000",
    category: "Pregnancy",
    icon: "🎯"
  },
  {
    id: "8",
    name: "Pregnancy: 3D/ 4D with Fetal Echocardiography",
    price: "5500",
    category: "Pregnancy",
    icon: "🎯"
  },
  {
    id: "9",
    name: "Ovulation: One Sitting",
    price: "1250",
    category: "Gynecology",
    icon: "🔬"
  },
  {
    id: "10",
    name: "Ovulation: Whole Cycle",
    price: "3500",
    category: "Gynecology",
    icon: "🔬"
  },
  {
    id: "11",
    name: "Pelvis (Lower Abdomen)",
    price: "2000",
    category: "General",
    icon: "🏥"
  },
  {
    id: "12",
    name: "Transvaginal Ultrasound (TVS)",
    price: "3750",
    category: "Gynecology",
    icon: "🔬"
  },
  {
    id: "13",
    name: "Kidneys & TVS",
    price: "3750",
    category: "General",
    icon: "🏥"
  },
  {
    id: "14",
    name: "Breast",
    price: "3000",
    category: "Small Parts",
    icon: "🩺"
  },
  {
    id: "15",
    name: "Thyroid/ Cranium",
    price: "2500",
    category: "Small Parts",
    icon: "🩺"
  },
  {
    id: "16",
    name: "Scrotum & Varicocele",
    price: "2750",
    category: "Small Parts",
    icon: "🩺"
  },
  {
    id: "17",
    name: "Carotid Doppler",
    price: "2750",
    category: "Doppler",
    icon: "💓"
  },
  {
    id: "18",
    name: "FNAC/ Aspiration",
    price: "3500",
    category: "Procedures",
    icon: "💉"
  },
  {
    id: "19",
    name: "CVS (Ultrasound + Disposables)",
    price: "4000",
    category: "Procedures",
    icon: "💉"
  },
  {
    id: "20",
    name: "Kidneys & Pelvis",
    price: "2250",
    category: "General",
    icon: "🏥"
  },
  {
    id: "21",
    name: "Upper Abdomen",
    price: "1900",
    category: "General",
    icon: "🏥"
  },
  {
    id: "22",
    name: "Abdomen (Upper Abdomen + Urinary Bladder)",
    price: "2000",
    category: "General",
    icon: "🏥"
  },
  {
    id: "23",
    name: "Abdomen & Pelvis (Transabdominal)",
    price: "2400",
    category: "General",
    icon: "🏥"
  },
  {
    id: "24",
    name: "Kidneys & Urinary Bladder",
    price: "1900",
    category: "General",
    icon: "🏥"
  },
  {
    id: "25",
    name: "Kidneys, Urinary Bladder & Prostate",
    price: "2000",
    category: "General",
    icon: "🏥"
  },
  {
    id: "26",
    name: "Transrectal Ultrasound (TRUS)",
    price: "3250",
    category: "Specialized",
    icon: "🔍"
  },
  {
    id: "27",
    name: "Kidneys & Suprarenals",
    price: "1750",
    category: "General",
    icon: "🏥"
  },
  {
    id: "28",
    name: "Pleura",
    price: "1500",
    category: "General",
    icon: "🏥"
  }
];

export const categories = [
  "Pregnancy",
  "Gynecology",
  "General",
  "Small Parts",
  "Doppler",
  "Procedures",
  "Specialized"
];

export const categoryIcons: Record<string, string> = {
  "Pregnancy": "👶",
  "Gynecology": "🔬",
  "General": "🏥",
  "Small Parts": "🩺",
  "Doppler": "💓",
  "Procedures": "💉",
  "Specialized": "🔍"
};

const STORAGE_KEY = 'homepage_services';

// Get services from localStorage or return defaults
export function getHomepageServices(): HomepageService[] {
  if (typeof window === 'undefined') {
    return defaultServices;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading homepage services from localStorage:', error);
  }
  
  return defaultServices;
}

// Save services to localStorage
export function saveHomepageServices(services: HomepageService[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    console.error('Error saving homepage services to localStorage:', error);
  }
}

// Reset services to defaults
export function resetHomepageServices(): HomepageService[] {
  if (typeof window === 'undefined') {
    return defaultServices;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting homepage services:', error);
  }
  
  return defaultServices;
}

// Generate a unique ID for new services
export function generateServiceId(): string {
  return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
