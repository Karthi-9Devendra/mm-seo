"use client";
import { useState, useEffect } from 'react';
import { dummySpecialties } from '@/data/dummyDoctorData';
import { ArrowLeft, Search, MapPin, Star, Calendar, Phone, Users, Award, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


interface SpecialtyDetail {
  name: string;
  description: string;
  icon: string;
  commonConditions: string[];
  doctorCount: number;
}

export default function SpecialtyPage({ param }: { param: {specialty: string; city?: string; state?: string;} }) {
  const { specialty, city, state } = param;
  const [specialtyDetail, setSpecialtyDetail] = useState<SpecialtyDetail | null>(null);
  const [subspecialties, setSubspecialties] = useState<{ name: string; description: string; doctorCount: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Define subspecialties mapping
  const subspecialtiesMapping: { [key: string]: { name: string; description: string; doctorCount: number }[] } = {
    'Cardiology': [
      { name: 'Interventional Cardiology', description: 'Minimally invasive procedures for heart conditions using catheters and specialized equipment', doctorCount: 12 },
      { name: 'Electrophysiology', description: 'Diagnosis and treatment of heart rhythm disorders and arrhythmias', doctorCount: 8 },
      { name: 'Heart Failure', description: 'Specialized care for patients with chronic heart failure and cardiomyopathy', doctorCount: 15 },
      { name: 'Preventive Cardiology', description: 'Focus on preventing heart disease through lifestyle modification and risk assessment', doctorCount: 10 },
      { name: 'General', description: 'Comprehensive cardiology care for all heart and vascular conditions', doctorCount: 25 }
    ],
    'Dermatology': [
      { name: 'Dermatopathology', description: 'Microscopic diagnosis of skin diseases and skin cancer detection', doctorCount: 6 },
      { name: 'Cosmetic Dermatology', description: 'Aesthetic treatments and procedures for skin enhancement and anti-aging', doctorCount: 18 },
      { name: 'Pediatric Dermatology', description: 'Specialized skin care for infants, children, and adolescents', doctorCount: 9 },
      { name: 'Dermatologic Surgery', description: 'Surgical treatment of skin cancers, moles, and other skin lesions', doctorCount: 14 },
      { name: 'General', description: 'Comprehensive dermatological care for all skin, hair, and nail conditions', doctorCount: 22 }
    ],
    'Family Medicine': [
      { name: 'Sports Medicine', description: 'Treatment and prevention of sports-related injuries and performance optimization', doctorCount: 11 },
      { name: 'Geriatric Medicine', description: 'Specialized healthcare for older adults and age-related conditions', doctorCount: 13 },
      { name: 'Addiction Medicine', description: 'Treatment of substance abuse and addiction disorders', doctorCount: 7 },
      { name: 'Palliative Care', description: 'Comfort care for patients with serious illnesses and end-of-life care', doctorCount: 9 },
      { name: 'General', description: 'Comprehensive primary care for patients of all ages and families', doctorCount: 35 }
    ],
    'Internal Medicine': [
      { name: 'Gastroenterology', description: 'Diagnosis and treatment of digestive system disorders', doctorCount: 16 },
      { name: 'Endocrinology', description: 'Treatment of diabetes, thyroid disorders, and hormonal conditions', doctorCount: 12 },
      { name: 'Rheumatology', description: 'Management of arthritis, autoimmune diseases, and joint disorders', doctorCount: 8 },
      { name: 'Infectious Disease', description: 'Treatment of complex infections and immune system disorders', doctorCount: 10 },
      { name: 'General', description: 'Comprehensive internal medicine care for adult patients', doctorCount: 28 }
    ],
    'Neurology': [
      { name: 'Epilepsy', description: 'Specialized care for seizure disorders and epilepsy management', doctorCount: 7 },
      { name: 'Movement Disorders', description: 'Treatment of Parkinson\'s disease, tremors, and movement abnormalities', doctorCount: 9 },
      { name: 'Stroke Medicine', description: 'Emergency and ongoing care for stroke patients and prevention', doctorCount: 11 },
      { name: 'Headache Medicine', description: 'Specialized treatment for migraines, cluster headaches, and chronic pain', doctorCount: 8 },
      { name: 'General', description: 'Comprehensive neurological care for nervous system disorders', doctorCount: 18 }
    ],
    'Obstetrics and Gynecology': [
      { name: 'Maternal-Fetal Medicine', description: 'High-risk pregnancy care and fetal medicine', doctorCount: 8 },
      { name: 'Reproductive Endocrinology', description: 'Fertility treatments and reproductive hormone disorders', doctorCount: 6 },
      { name: 'Gynecologic Oncology', description: 'Treatment of cancers affecting the female reproductive system', doctorCount: 5 },
      { name: 'Urogynecology', description: 'Treatment of pelvic floor disorders and urinary incontinence', doctorCount: 7 },
      { name: 'General', description: 'Comprehensive women\'s health, pregnancy, and gynecological care', doctorCount: 24 }
    ],
    'Ophthalmology': [
      { name: 'Retinal Diseases', description: 'Treatment of retinal conditions, macular degeneration, and diabetic eye disease', doctorCount: 9 },
      { name: 'Corneal Diseases', description: 'Corneal transplants, infections, and anterior segment disorders', doctorCount: 6 },
      { name: 'Glaucoma', description: 'Diagnosis and treatment of glaucoma and optic nerve disorders', doctorCount: 8 },
      { name: 'Pediatric Ophthalmology', description: 'Eye care for children including strabismus and amblyopia', doctorCount: 5 },
      { name: 'General', description: 'Comprehensive eye care, vision correction, and eye surgery', doctorCount: 20 }
    ],
    'Orthopedic Surgery': [
      { name: 'Sports Medicine', description: 'Surgical and non-surgical treatment of sports injuries', doctorCount: 14 },
      { name: 'Joint Replacement', description: 'Hip, knee, and shoulder replacement surgeries', doctorCount: 12 },
      { name: 'Spine Surgery', description: 'Surgical treatment of spinal conditions and back disorders', doctorCount: 10 },
      { name: 'Hand Surgery', description: 'Treatment of hand, wrist, and upper extremity conditions', doctorCount: 7 },
      { name: 'General', description: 'Comprehensive orthopedic surgery for bones, joints, and muscles', doctorCount: 25 }
    ],
    'Otolaryngology': [
      { name: 'Head and Neck Surgery', description: 'Treatment of head and neck cancers and complex surgical conditions', doctorCount: 8 },
      { name: 'Rhinology', description: 'Sinus surgery and nasal disorders treatment', doctorCount: 6 },
      { name: 'Otology', description: 'Treatment of ear disorders, hearing loss, and balance problems', doctorCount: 7 },
      { name: 'Pediatric ENT', description: 'Ear, nose, and throat care for children', doctorCount: 5 },
      { name: 'General', description: 'Comprehensive ENT care for all ear, nose, and throat conditions', doctorCount: 18 }
    ],
    'Pediatrics': [
      { name: 'Pediatric Cardiology', description: 'Heart conditions and congenital heart defects in children', doctorCount: 6 },
      { name: 'Pediatric Neurology', description: 'Neurological disorders and developmental conditions in children', doctorCount: 8 },
      { name: 'Pediatric Gastroenterology', description: 'Digestive system disorders in infants and children', doctorCount: 7 },
      { name: 'Pediatric Endocrinology', description: 'Diabetes, growth disorders, and hormonal conditions in children', doctorCount: 5 },
      { name: 'General', description: 'Comprehensive pediatric care for children from birth through adolescence', doctorCount: 32 }
    ],
    'Pediatric Dermatology': [
      { name: 'Pediatric Dermatopathology', description: 'Microscopic diagnosis of skin diseases in children', doctorCount: 2 },
      { name: 'Pediatric Cosmetic Dermatology', description: 'Aesthetic dermatology treatments for pediatric patients', doctorCount: 3 },
      { name: 'Genetic Skin Disorders', description: 'Treatment of inherited and congenital skin conditions', doctorCount: 4 },
      { name: 'General', description: 'Comprehensive pediatric dermatology care for children\'s skin conditions', doctorCount: 8 }
    ],
    'Psychiatry': [
      { name: 'Child and Adolescent Psychiatry', description: 'Mental health care for children and teenagers', doctorCount: 12 },
      { name: 'Addiction Psychiatry', description: 'Treatment of substance abuse and behavioral addictions', doctorCount: 8 },
      { name: 'Geriatric Psychiatry', description: 'Mental health care for older adults and dementia', doctorCount: 9 },
      { name: 'Forensic Psychiatry', description: 'Psychiatric evaluation and treatment in legal contexts', doctorCount: 4 },
      { name: 'General', description: 'Comprehensive psychiatric care for mental health disorders', doctorCount: 28 }
    ],
    'Radiology': [
      { name: 'Interventional Radiology', description: 'Minimally invasive procedures guided by imaging', doctorCount: 10 },
      { name: 'Neuroradiology', description: 'Imaging of the brain, spine, and nervous system', doctorCount: 8 },
      { name: 'Musculoskeletal Radiology', description: 'Imaging of bones, joints, and soft tissues', doctorCount: 9 },
      { name: 'Pediatric Radiology', description: 'Medical imaging specialized for children', doctorCount: 6 },
      { name: 'General', description: 'Comprehensive diagnostic imaging and radiology services', doctorCount: 22 }
    ],
    'Surgery': [
      { name: 'Cardiac Surgery', description: 'Heart surgery including bypass, valve repair, and transplants', doctorCount: 8 },
      { name: 'Neurosurgery', description: 'Brain and spinal cord surgery', doctorCount: 12 },
      { name: 'Plastic Surgery', description: 'Reconstructive and cosmetic surgery', doctorCount: 15 },
      { name: 'Vascular Surgery', description: 'Surgery of blood vessels and circulatory system', doctorCount: 9 },
      { name: 'General', description: 'Comprehensive general surgery for various conditions', doctorCount: 25 }
    ],
    'Urology': [
      { name: 'Urologic Oncology', description: 'Treatment of cancers affecting the urinary tract and male reproductive system', doctorCount: 7 },
      { name: 'Pediatric Urology', description: 'Urological conditions in children and adolescents', doctorCount: 5 },
      { name: 'Female Urology', description: 'Urological conditions specific to women', doctorCount: 8 },
      { name: 'Andrology', description: 'Male reproductive health and fertility', doctorCount: 6 },
      { name: 'General', description: 'Comprehensive urological care for all urinary tract conditions', doctorCount: 18 }
    ]
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Find the specialty detail from dummySpecialties
    const found = dummySpecialties.find(s =>
      typeof s.name === 'string' && typeof specialty === 'string'
        ? s.name.toLowerCase() === specialty.toLowerCase()
        : s.name === specialty
    );
    setSpecialtyDetail(found || null);
    setSubspecialties(subspecialtiesMapping[specialty] || []);
    setLoading(false);
  }, [specialty]);

// Filter subspecialties based on search
const filteredSubspecialties =
  (subspecialtiesMapping[specialty]
    ? subspecialtiesMapping[specialty].filter(subspecialty =>
        subspecialty?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subspecialty?.description.toLowerCase().includes(searchTerm.toLowerCase())
     
      )
    : []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading {specialty} subspecialties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  function onBack() {
  window.history.back();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => {
          onBack?.();
          window.dispatchEvent(new CustomEvent('navigate-back'));
        }}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {city ? `${city} Specialties` : 'Specialties'}
      </Button>

      {/* Specialty Header */}
      {specialtyDetail && (
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/5 to-cyan/5 p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-sm">
                    {specialtyDetail.icon}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                      {specialtyDetail.name} Subspecialties {city ? `in ${city}${state ? `, ${state}` : ''}` : ''}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4">{specialtyDetail.description}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium">{filteredSubspecialties.length} subspecialty areas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-medium">Fellowship-trained specialists</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <div className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search subspecialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {filteredSubspecialties.length} {filteredSubspecialties.length === 1 ? 'subspecialty' : 'subspecialties'} found
        </p>
      </div>

      {/* Subspecialties Grid */}
      <div className="grid gap-6">
        {filteredSubspecialties.map((subspecialty, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate-to-subspecialty', { 
                detail: { specialty, subspecialty: subspecialty.name, city, state } 
              }));
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                    👩‍⚕️
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{subspecialty.name}</h3>
                      <p className="text-muted-foreground mb-4">{subspecialty.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{subspecialty.doctorCount} specialists available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Fellowship-trained experts</span>
                    </div>
                    {subspecialty.name === 'General' && (
                      <Badge variant="outline" className="text-primary border-primary">
                        Primary Care
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubspecialties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No subspecialties found matching your search.</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* SEO Content */}
      <div className="mt-16 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">{specialty} Subspecialty Care{city ? ` in ${city}` : ''}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Why Choose Subspecialty Care?</h3>
                <p className="text-muted-foreground">
                  Subspecialists have completed additional fellowship training beyond their residency, 
                  providing the most advanced and specialized care in their specific area of expertise.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Finding the Right Subspecialist</h3>
                <p className="text-muted-foreground">
                  Browse our subspecialty listings to find doctors with the specific expertise for your condition. 
                  Each subspecialist has undergone extensive training in their focused area of medicine.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}