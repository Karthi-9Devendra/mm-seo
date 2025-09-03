
export interface DoctorProfileData {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  boardCertified: boolean;
  professionalScore: number;
  npiNumber: string;
  imageUrl: string;
  location: {
    city: string;
    state: string;
    address: string;
    zipCode: string;
  };
  about: string;
  insuranceAccepted: string[];
  affiliatedHospitals: string[];
  education: {
    medicalSchool: string;
    residency: string;
    fellowship?: string;
  };
  phoneNumber: string;
  availableAppointments: boolean;
}

export const dummyDoctor: DoctorProfileData = {
  id: '1',
  name: 'Dr. Kelly Forman',
  title: 'MD',
  specialty: 'Pediatrics',
  rating: 4.8,
  reviewCount: 120,
  yearsExperience: 15,
  boardCertified: true,
  professionalScore: 95,
  npiNumber: '1234567890',
  imageUrl: '/doctor-placeholder.jpg',
  location: {
    city: 'Orlando',
    state: 'FL',
    address: '123 Main St',
    zipCode: '32801',
  },
  about: 'Dr. Kelly Forman is a board-certified pediatrician with over 15 years of experience. She is passionate about providing quality care to children and their families.',
  insuranceAccepted: [
    'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Medicaid'
  ],
  affiliatedHospitals: [
    'Orlando Health Arnold Palmer Hospital for Children',
    'AdventHealth for Children'
  ],
  education: {
    medicalSchool: 'Harvard Medical School',
    residency: 'Johns Hopkins Hospital',
    fellowship: 'Boston Children\'s Hospital'
  },
  phoneNumber: '(555) 123-4567',
  availableAppointments: true,
};

// (Place this in your component file or import it)

export interface featuredSpecialty {
  name: string;
  description: string;
  icon: string; // Emoji or SVG component
  commonConditions: string[];
  doctorCount: number;
}

export const dummySpecialties: featuredSpecialty[] = [
  {
    name: 'Cardiology',
    description: 'Specializes in heart conditions and the cardiovascular system.',
    icon: '❤️',
    commonConditions: ['Hypertension', 'Coronary Artery Disease', 'Heart Failure', 'Arrhythmia', 'Cholesterol'],
    doctorCount: 125,
  },
  {
    name: 'Dermatology',
    description: 'Focuses on skin, hair, and nail conditions.',
    icon: '✨',
    commonConditions: ['Acne', 'Eczema', 'Psoriasis', 'Skin Cancer', 'Rosacea'],
    doctorCount: 88,
  },
  {
    name: 'Pediatric Dermatology',
    description: 'Specialized care for children\'s skin conditions.',
    icon: '👶',
    commonConditions: ['Diaper Rash', 'Birthmarks', 'Atopic Dermatitis', 'Warts'],
    doctorCount: 42,
  },
  {
    name: 'Family Medicine',
    description: 'Comprehensive healthcare for individuals and families.',
    icon: '👨‍👩‍👧‍👦',
    commonConditions: ['Common Cold', 'Diabetes Management', 'Annual Physicals', 'Vaccinations'],
    doctorCount: 210,
  },
  {
    name: 'Orthopedics',
    description: 'Deals with the musculoskeletal system, including bones and joints.',
    icon: '🦴',
    commonConditions: ['Fractures', 'Arthritis', 'Sports Injuries', 'Back Pain'],
    doctorCount: 95,
  },
  {
    name: 'Neurology',
    description: 'Focuses on disorders of the nervous system.',
    icon: '🧠',
    commonConditions: ['Migraines', 'Epilepsy', 'Stroke', 'Parkinson\'s Disease'],
    doctorCount: 76,
  },
];