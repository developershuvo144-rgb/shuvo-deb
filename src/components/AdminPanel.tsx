import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth, login, logout } from '../firebase';
import { Project, Profile, Skill, Service, Experience, Testimonial, Stat, FAQ, Announcement, SiteSettings, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  LogIn, 
  LogOut, 
  Save, 
  X,
  User,
  Briefcase,
  Code2,
  Wrench,
  History,
  Shield,
  Database,
  Globe,
  Search,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Link as LinkIcon,
  Facebook,
  Linkedin,
  Github,
  FileText,
  BarChart3,
  HelpCircle,
  Megaphone,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  MessageSquare,
  Settings as SettingsIcon,
  Eye,
  Palette,
  Layout
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';

export const AdminPanel: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [user, setUser] = useState(auth.currentUser);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    tagline: '',
    bio: '',
    aboutMe: '',
    email: '',
    phone: '',
    address: '',
    profileImage: '',
    githubUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    cvUrl: ''
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement>({ text: '', isActive: false });
  const [settings, setSettings] = useState<SiteSettings>({
    accentColor: '#10b981',
    showTerminal: true,
    showChatBot: true,
    showStats: true,
    showTestimonials: true,
    showFAQ: true,
    enableCustomCursor: true,
    enableNoiseEffect: true,
    visitorCount: 0,
    isMaintenanceMode: false,
    defaultLanguage: 'en'
  });
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'projects' | 'skills' | 'services' | 'experience' | 'testimonials' | 'stats' | 'faqs' | 'announcement' | 'settings'>('analytics');
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(u => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubProjects = onSnapshot(qProjects, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'projects'));

    const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (snap) => {
      if (snap.exists()) setProfile(snap.data() as Profile);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'profile/main'));

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snap) => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() } as Skill)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'skills'));

    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'services'));

    const unsubExperiences = onSnapshot(collection(db, 'experiences'), (snap) => {
      setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'experiences'));

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'testimonials'));

    const unsubStats = onSnapshot(collection(db, 'stats'), (snap) => {
      setStats(snap.docs.map(d => ({ id: d.id, ...d.data() } as Stat)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stats'));

    const unsubFaqs = onSnapshot(collection(db, 'faqs'), (snap) => {
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'faqs'));

    const unsubAnnouncement = onSnapshot(doc(db, 'announcement', 'main'), (snap) => {
      if (snap.exists()) setAnnouncement(snap.data() as Announcement);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'announcement/main'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
      if (snap.exists()) setSettings(snap.data() as SiteSettings);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/main'));

    return () => {
      unsubProjects();
      unsubProfile();
      unsubSkills();
      unsubServices();
      unsubExperiences();
      unsubTestimonials();
      unsubStats();
      unsubFaqs();
      unsubAnnouncement();
      unsubSettings();
    };
  }, [user]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const isAdmin = user?.email === 'developershuvo144@gmail.com';

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/10">
        <LogIn size={48} className="text-white/20 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Admin Access</h2>
        <p className="text-white/60 mb-6 text-center max-w-xs">Please login with your authorized Google account to manage content.</p>
        <button onClick={login} className="px-6 py-3 bg-accent text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20">
          <LogIn size={18} /> Login with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-white/60">
        Access Denied. Only the owner can manage this site.
        <button onClick={logout} className="block mx-auto mt-4 text-accent hover:underline">Logout</button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'profile', 'main'), {
        ...profile,
        updatedAt: serverTimestamp()
      });
      showToast('Profile updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'profile/main');
      showToast('Failed to update profile', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Firestore document safety
      showToast('Image too large. Max 800KB.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (profile) {
        setProfile({ ...profile, profileImage: base64String });
      }
      setIsUploading(false);
      showToast('Image uploaded to preview!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Upload failed', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false, projectId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      showToast('Image too large (max 800KB)', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isNew) {
        setNewProject(prev => ({ ...prev, image: base64String }));
      } else if (projectId) {
        handleUpdateProject(projectId, { image: base64String });
      }
      setIsUploading(false);
      showToast('Image uploaded!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Upload failed', 'error');
    };
    reader.readAsDataURL(file);
  };

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    longDescription: '',
    category: 'Web',
    tags: [],
    technologies: [],
    features: [],
    gallery: [],
    image: '',
    githubUrl: '',
    liveUrl: ''
  });

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: 'Frontend',
    level: 80,
    icon: 'Code2'
  });

  const [newService, setNewService] = useState<Partial<Service>>({
    title: '',
    description: '',
    icon: 'Wrench'
  });

  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    position: '',
    period: '',
    description: ''
  });

  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    content: '',
    avatar: 'https://i.pravatar.cc/150?u=client'
  });

  const [newStat, setNewStat] = useState<Partial<Stat>>({
    label: '',
    value: ''
  });

  const [newFAQ, setNewFAQ] = useState<Partial<FAQ>>({
    question: '',
    answer: ''
  });

  const handleAddProject = async () => {
    try {
      if (!newProject.title || !newProject.description) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        createdAt: serverTimestamp()
      });
      setNewProject({
        title: '',
        description: '',
        longDescription: '',
        category: 'Web',
        tags: [],
        technologies: [],
        features: [],
        gallery: [],
        image: '',
        githubUrl: '',
        liveUrl: ''
      });
      setShowAddForm(null);
      showToast('Project added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
      showToast('Failed to add project', 'error');
    }
  };

  const handleUpdateProject = async (id: string, data: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), data);
      showToast('Project updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteProject = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'projects', id));
          showToast('Project deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddService = async () => {
    try {
      if (!newService.title || !newService.description) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'services'), {
        ...newService
      });
      setNewService({
        title: '',
        description: '',
        icon: 'Wrench'
      });
      setShowAddForm(null);
      showToast('Service added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'services');
      showToast('Failed to add service', 'error');
    }
  };

  const handleUpdateService = async (id: string, data: Partial<Service>) => {
    try {
      await updateDoc(doc(db, 'services', id), data);
      showToast('Service updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteService = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'services', id));
          showToast('Service deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddExperience = async () => {
    try {
      if (!newExperience.company || !newExperience.position) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'experiences'), {
        ...newExperience
      });
      setNewExperience({
        company: '',
        position: '',
        period: '',
        description: ''
      });
      setShowAddForm(null);
      showToast('Experience added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'experiences');
      showToast('Failed to add experience', 'error');
    }
  };

  const handleUpdateExperience = async (id: string, data: Partial<Experience>) => {
    try {
      await updateDoc(doc(db, 'experiences', id), data);
      showToast('Experience updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteExperience = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Experience',
      message: 'Are you sure you want to delete this experience entry?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'experiences', id));
          showToast('Experience deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `experiences/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddTestimonial = async () => {
    try {
      if (!newTestimonial.name || !newTestimonial.content) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'testimonials'), {
        ...newTestimonial
      });
      setNewTestimonial({
        name: '',
        role: '',
        content: '',
        avatar: 'https://i.pravatar.cc/150?u=client'
      });
      setShowAddForm(null);
      showToast('Testimonial added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'testimonials');
      showToast('Failed to add testimonial', 'error');
    }
  };

  const handleUpdateTestimonial = async (id: string, data: Partial<Testimonial>) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), data);
      showToast('Testimonial updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this testimonial?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'testimonials', id));
          showToast('Testimonial deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteSkill = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Skill',
      message: 'Are you sure you want to delete this skill?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'skills', id));
          showToast('Skill deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `skills/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateSkill = async (id: string, data: Partial<Skill>) => {
    try {
      await updateDoc(doc(db, 'skills', id), data);
      showToast('Skill updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `skills/${id}`);
      showToast('Update failed', 'error');
    }
  };

  const handleAddSkill = async () => {
    try {
      if (!newSkill.name) {
        showToast('Please enter skill name', 'error');
        return;
      }
      await addDoc(collection(db, 'skills'), {
        ...newSkill
      });
      setNewSkill({
        name: '',
        category: 'Frontend',
        level: 80,
        icon: 'Code2'
      });
      setShowAddForm(null);
      showToast('Skill added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'skills');
      showToast('Failed to add skill', 'error');
    }
  };

  const handleAddStat = async () => {
    try {
      if (!newStat.label || !newStat.value) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'stats'), {
        ...newStat
      });
      setNewStat({
        label: '',
        value: ''
      });
      setShowAddForm(null);
      showToast('Stat added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stats');
      showToast('Failed to add stat', 'error');
    }
  };

  const handleUpdateStat = async (id: string, data: Partial<Stat>) => {
    try {
      await updateDoc(doc(db, 'stats', id), data);
      showToast('Stat updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteStat = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Stat',
      message: 'Are you sure you want to delete this stat?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'stats', id));
          showToast('Stat deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `stats/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddFAQ = async () => {
    try {
      if (!newFAQ.question || !newFAQ.answer) {
        showToast('Please fill required fields', 'error');
        return;
      }
      await addDoc(collection(db, 'faqs'), {
        ...newFAQ
      });
      setNewFAQ({
        question: '',
        answer: ''
      });
      setShowAddForm(null);
      showToast('FAQ added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'faqs');
      showToast('Failed to add FAQ', 'error');
    }
  };

  const handleUpdateFAQ = async (id: string, data: Partial<FAQ>) => {
    try {
      await updateDoc(doc(db, 'faqs', id), data);
      showToast('FAQ updated!');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteFAQ = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'faqs', id));
          showToast('FAQ deleted!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
          showToast('Delete failed', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'announcement', 'main'), announcement);
      showToast('Announcement updated!');
    } catch (err) {
      showToast('Failed to update announcement', 'error');
    }
  };

  const handleClearProfile = async () => {
    if (!confirm('Are you sure you want to clear your profile? This will reset all profile fields.')) return;
    try {
      await setDoc(doc(db, 'profile', 'main'), {
        fullName: '',
        tagline: '',
        bio: '',
        aboutMe: '',
        email: '',
        phone: '',
        address: '',
        profileImage: '',
        githubUrl: '',
        linkedinUrl: '',
        facebookUrl: '',
        cvUrl: '',
        updatedAt: serverTimestamp()
      });
      showToast('Profile cleared!');
    } catch (err) {
      showToast('Failed to clear profile', 'error');
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will seed initial data. Continue?')) return;
    
    try {
      // Seed Profile
      await setDoc(doc(db, 'profile', 'main'), {
        fullName: 'Dhrubojyoti deb shuvo',
        tagline: 'Full Stack Developer & Automation Expert',
        bio: 'I am a passionate full-stack developer with a focus on creating seamless, intelligent digital experiences.',
        aboutMe: 'I am a passionate full-stack developer with a focus on creating seamless, intelligent digital experiences. With expertise in React, Node.js, and various automation tools, I strive to build solutions that are not only functional but also elegant and efficient.',
        email: 'developershuvo144@gmail.com',
        phone: '+8801XXXXXXXXX',
        address: 'Habiganj, Bangladesh',
        profileImage: 'https://picsum.photos/seed/shuvo/800/1000',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
        facebookUrl: 'https://facebook.com',
        cvUrl: '#',
        updatedAt: serverTimestamp()
      });

      // Seed Skills
      const initialSkills = [
        { name: 'React', level: 95, category: 'Frontend' },
        { name: 'Node.js', level: 90, category: 'Backend' },
        { name: 'TypeScript', level: 85, category: 'Language' },
        { name: 'Firebase', level: 90, category: 'Database' },
        { name: 'Gemini AI', level: 80, category: 'AI' },
        { name: 'Tailwind CSS', level: 95, category: 'Design' }
      ];

      for (const skill of initialSkills) {
        await addDoc(collection(db, 'skills'), skill);
      }

      // Seed Services
      const initialServices = [
        { title: 'Web Development', description: 'Building modern, responsive, and high-performance web applications using the latest technologies.', icon: 'Globe' },
        { title: 'AI Integration', description: 'Integrating advanced AI models like Gemini to create intelligent and interactive user experiences.', icon: 'Cpu' },
        { title: 'Automation', description: 'Streamlining workflows and processes through custom automation scripts and tools.', icon: 'Settings' }
      ];

      for (const service of initialServices) {
        await addDoc(collection(db, 'services'), service);
      }

      // Seed Experiences
      const initialExperiences = [
        { company: 'Freelance', position: 'Full Stack Developer', period: '2021 - Present', description: 'Working on various international projects focusing on web development and automation.' },
        { company: 'Tech Solutions', position: 'Junior Developer', period: '2019 - 2021', description: 'Assisted in developing and maintaining client websites and internal tools.' }
      ];

      for (const exp of initialExperiences) {
        await addDoc(collection(db, 'experiences'), exp);
      }

      // Seed Testimonials
      const initialTestimonials = [
        { name: 'John Doe', role: 'CEO, TechCorp', content: 'Dhrubojyoti is an exceptional developer who delivered our project ahead of schedule and with great quality.', avatar: 'https://i.pravatar.cc/150?u=john' },
        { name: 'Jane Smith', role: 'Product Manager', content: 'Working with Shuvo was a pleasure. His automation skills saved us countless hours of manual work.', avatar: 'https://i.pravatar.cc/150?u=jane' }
      ];

      for (const testimonial of initialTestimonials) {
        await addDoc(collection(db, 'testimonials'), testimonial);
      }

      alert('Data seeded successfully!');
    } catch (err) {
      console.error('Seeding failed:', err);
      alert('Seeding failed. Check console.');
    }
  };

  return (
    <div className="space-y-12 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-accent text-black' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Save size={18} /> : <X size={18} />}
            <span className="font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
              <p className="text-white/60 mb-8">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black shrink-0">
            <Shield size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">Admin Panel</h2>
            <p className="text-white/40 text-sm truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex-1 md:flex-none px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Layout size={16} /> Back to Site
            </button>
          )}
          <button 
            onClick={handleSeedData}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Database size={16} /> Seed Data
          </button>
          <button 
            onClick={logout}
            className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 no-scrollbar">
        {[
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'profile', icon: User, label: 'Profile' },
          { id: 'projects', icon: Briefcase, label: 'Projects' },
          { id: 'skills', icon: Code2, label: 'Skills' },
          { id: 'services', icon: Wrench, label: 'Services' },
          { id: 'experience', icon: History, label: 'Experience' },
          { id: 'testimonials', icon: Mail, label: 'Testimonials' },
          { id: 'stats', icon: BarChart3, label: 'Stats' },
          { id: 'faqs', icon: HelpCircle, label: 'FAQs' },
          { id: 'announcement', icon: Megaphone, label: 'Notice' },
          { id: 'settings', icon: SettingsIcon, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeTab === tab.id ? 'bg-accent text-black shadow-md shadow-accent/20' : 'hover:bg-white/5 text-white/60'
            }`}
          >
            <tab.icon size={16} className="shrink-0" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-8 md:p-12">
        {activeTab === 'analytics' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Distribution */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <PieChartIcon className="text-accent" size={20} />
                  <h3 className="text-lg font-bold">Project Distribution</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts: Record<string, number> = {};
                          projects.forEach(p => {
                            counts[p.category] = (counts[p.category] || 0) + 1;
                          });
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skill Proficiency */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="text-accent" size={20} />
                  <h3 className="text-lg font-bold">Skill Proficiency</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skills.sort((a,b) => b.level - a.level).slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="level" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'accent' },
                { label: 'Total Skills', value: skills.length, icon: Code2, color: 'blue' },
                { label: 'Services', value: services.length, icon: Wrench, color: 'orange' },
                { label: 'Testimonials', value: testimonials.length, icon: MessageSquare, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-4`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Toggles */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Layout className="text-accent" size={20} />
                  <h3 className="text-lg font-bold">Feature Flags</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'showTerminal', label: 'Interactive Terminal', icon: Code2 },
                    { id: 'showChatBot', label: 'AI ChatBot', icon: MessageSquare },
                    { id: 'showStats', label: 'Stats Section', icon: BarChart3 },
                    { id: 'showTestimonials', label: 'Testimonials', icon: Mail },
                    { id: 'showFAQ', label: 'FAQ Section', icon: HelpCircle },
                    { id: 'enableCustomCursor', label: 'Custom Cursor', icon: Eye },
                    { id: 'enableNoiseEffect', label: 'Noise Background', icon: Activity },
                    { id: 'isMaintenanceMode', label: 'Maintenance Mode', icon: Shield }
                  ].map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <feature.icon size={18} className="text-white/40" />
                        <span className="text-sm font-medium">{feature.label}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newSettings = { ...settings, [feature.id]: !settings[feature.id as keyof SiteSettings] };
                          setDoc(doc(db, 'settings', 'main'), newSettings);
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${settings[feature.id as keyof SiteSettings] ? 'bg-accent' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[feature.id as keyof SiteSettings] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme & Appearance */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="text-accent" size={20} />
                  <h3 className="text-lg font-bold">Appearance & Language</h3>
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-mono text-white/40 uppercase tracking-widest block">Default Language</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['en', 'bn'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setDoc(doc(db, 'settings', 'main'), { ...settings, defaultLanguage: l as 'en' | 'bn' })}
                        className={`p-4 rounded-2xl border transition-all font-bold ${
                          settings.defaultLanguage === l 
                            ? 'bg-accent border-accent text-black shadow-md shadow-accent/20' 
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        {l === 'en' ? 'English' : 'বাংলা'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-mono text-white/40 uppercase tracking-widest block">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => setDoc(doc(db, 'settings', 'main'), { ...settings, accentColor: color })}
                        className={`w-10 h-10 rounded-xl border-2 transition-all ${settings.accentColor === color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={settings.accentColor}
                    onChange={e => setDoc(doc(db, 'settings', 'main'), { ...settings, accentColor: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white font-mono text-sm"
                    placeholder="#hex-color"
                  />
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Visitor Counter</p>
                      <p className="text-xs text-white/40">Total unique site visits</p>
                    </div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      {settings.visitorCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text" 
                  value={profile.fullName || ''} 
                  onChange={e => setProfile({...profile, fullName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Tagline
                </label>
                <input 
                  type="text" 
                  value={profile.tagline || ''} 
                  onChange={e => setProfile({...profile, tagline: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Bio (Short)
                </label>
                <textarea 
                  value={profile.bio || ''} 
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none h-24 text-white"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> About Me (Detailed)
                </label>
                <textarea 
                  value={profile.aboutMe || ''} 
                  onChange={e => setProfile({...profile, aboutMe: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none h-40 text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input 
                  type="email" 
                  value={profile.email || ''} 
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} /> Phone
                </label>
                <input 
                  type="text" 
                  value={profile.phone || ''} 
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> Address
                </label>
                <input 
                  type="text" 
                  value={profile.address || ''} 
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} /> Profile Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-black/40 border border-white/10 rounded-2xl">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent/20 shrink-0">
                    <img 
                      src={profile.profileImage || 'https://picsum.photos/seed/profile/200/200'} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <p className="text-sm text-white/60">Upload a new profile picture from your device.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className={`cursor-pointer px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Plus size={16} />
                        {isUploading ? 'Uploading...' : 'Choose Image'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                      <input 
                        type="text" 
                        placeholder="Or paste Image URL"
                        value={profile.profileImage || ''} 
                        onChange={e => setProfile({...profile, profileImage: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent/50 outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Github size={14} /> GitHub URL
                </label>
                <input 
                  type="text" 
                  value={profile.githubUrl || ''} 
                  onChange={e => setProfile({...profile, githubUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Linkedin size={14} /> LinkedIn URL
                </label>
                <input 
                  type="text" 
                  value={profile.linkedinUrl || ''} 
                  onChange={e => setProfile({...profile, linkedinUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Facebook size={14} /> Facebook URL
                </label>
                <input 
                  type="text" 
                  value={profile.facebookUrl || ''} 
                  onChange={e => setProfile({...profile, facebookUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} /> CV URL
                </label>
                <input 
                  type="text" 
                  value={profile.cvUrl || ''} 
                  onChange={e => setProfile({...profile, cvUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-accent/50 outline-none text-white"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                className="flex-1 px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Save size={20} /> Save Changes
              </button>
              <button 
                type="button"
                onClick={handleClearProfile}
                className="px-8 py-4 bg-red-500/10 text-red-400 font-bold rounded-2xl hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={20} /> Clear Profile
              </button>
            </div>
          </form>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <h3 className="text-xl font-bold text-white">Manage Projects</h3>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-accent/50 transition-all text-xs"
                  />
                </div>
                <button 
                  onClick={() => setShowAddForm(showAddForm === 'projects' ? null : 'projects')}
                  className={`p-3 rounded-xl transition-all ${showAddForm === 'projects' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
                >
                  {showAddForm === 'projects' ? <X size={20} /> : <Plus size={20} />}
                </button>
              </div>
            </div>

            {showAddForm === 'projects' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-6"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Project
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Project Title"
                    value={newProject.title || ''} 
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <select 
                    value={newProject.category || 'Web'}
                    onChange={e => setNewProject({...newProject, category: e.target.value as any})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  >
                    <option value="Web">Web</option>
                    <option value="Bot">Bot</option>
                    <option value="VBA">VBA</option>
                    <option value="ERP">ERP</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Project Description"
                  value={newProject.description || ''} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-24 text-white focus:border-accent/50 outline-none"
                />
                <textarea 
                  placeholder="Long Description (Optional)"
                  value={newProject.longDescription || ''} 
                  onChange={e => setNewProject({...newProject, longDescription: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-32 text-white focus:border-accent/50 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Features (comma separated)"
                    value={newProject.features?.join(', ') || ''} 
                    onChange={e => setNewProject({...newProject, features: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Technologies (comma separated)"
                    value={newProject.technologies?.join(', ') || ''} 
                    onChange={e => setNewProject({...newProject, technologies: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon size={14} /> Project Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm flex items-center gap-2">
                      <Plus size={16} /> Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleProjectImageUpload(e, true)}
                      />
                    </label>
                    <input 
                      type="text" 
                      placeholder="Or Image URL"
                      value={newProject.image || ''}
                      onChange={e => setNewProject({...newProject, image: e.target.value})}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white focus:border-accent/50 outline-none"
                    />
                  </div>
                  {newProject.image && (
                    <div className="w-32 h-20 rounded-xl overflow-hidden border border-white/10">
                      <img src={newProject.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder="Gallery Images (comma separated URLs)"
                    value={newProject.gallery?.join(', ') || ''} 
                    onChange={e => setNewProject({...newProject, gallery: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="GitHub URL"
                    value={newProject.githubUrl || ''} 
                    onChange={e => setNewProject({...newProject, githubUrl: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Live Demo URL"
                    value={newProject.liveUrl || ''} 
                    onChange={e => setNewProject({...newProject, liveUrl: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <button 
                  onClick={handleAddProject}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Project
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map(project => (
                <div key={project.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={project.title || ''} 
                      onChange={e => handleUpdateProject(project.id!, { title: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                      placeholder="Project Title"
                    />
                    <select 
                      value={project.category || 'Web'}
                      onChange={e => handleUpdateProject(project.id!, { category: e.target.value as any })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                    >
                      <option value="Web">Web</option>
                      <option value="Bot">Bot</option>
                      <option value="VBA">VBA</option>
                      <option value="ERP">ERP</option>
                    </select>
                  </div>
                  <textarea 
                    value={project.description || ''} 
                    onChange={e => handleUpdateProject(project.id!, { description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 text-white"
                    placeholder="Short Description"
                  />
                  <textarea 
                    value={project.longDescription || ''} 
                    onChange={e => handleUpdateProject(project.id!, { longDescription: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 text-white"
                    placeholder="Long Description (Optional)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={project.features?.join(', ') || ''} 
                      onChange={e => handleUpdateProject(project.id!, { features: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                      placeholder="Features (comma separated)"
                    />
                    <input 
                      type="text" 
                      value={project.technologies?.join(', ') || ''} 
                      onChange={e => handleUpdateProject(project.id!, { technologies: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                      placeholder="Technologies (comma separated)"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <label className="cursor-pointer p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs flex items-center gap-2">
                        <ImageIcon size={14} /> Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleProjectImageUpload(e, false, project.id)}
                        />
                      </label>
                      <input 
                        type="text" 
                        placeholder="Image URL"
                        value={project.image || ''}
                        onChange={e => handleUpdateProject(project.id!, { image: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Gallery Images (comma separated URLs)"
                      value={project.gallery?.join(', ') || ''} 
                      onChange={e => handleUpdateProject(project.id!, { gallery: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="GitHub URL"
                        value={project.githubUrl || ''}
                        onChange={e => handleUpdateProject(project.id!, { githubUrl: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs w-32 text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Live URL"
                        value={project.liveUrl || ''}
                        onChange={e => handleUpdateProject(project.id!, { liveUrl: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs w-32 text-white"
                      />
                    </div>
                    <button 
                      onClick={() => handleDeleteProject(project.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Skills</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'skills' ? null : 'skills')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'skills' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'skills' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'skills' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Skill
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Skill Name"
                    value={newSkill.name || ''} 
                    onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <select 
                    value={newSkill.category || 'Frontend'}
                    onChange={e => setNewSkill({...newSkill, category: e.target.value as any})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Level (0-100)"
                    value={newSkill.level ?? 80} 
                    onChange={e => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <button 
                  onClick={handleAddSkill}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Skill
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map(skill => (
                <div key={skill.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4">
                  <input 
                    type="text" 
                    value={skill.name || ''} 
                    onChange={e => handleUpdateSkill(skill.id!, { name: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                  />
                  <input 
                    type="number" 
                    value={skill.level ?? 0} 
                    onChange={e => handleUpdateSkill(skill.id!, { level: parseInt(e.target.value) })}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                  />
                  <button 
                    onClick={() => handleDeleteSkill(skill.id!)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Services</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'services' ? null : 'services')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'services' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'services' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'services' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Service
                </h4>
                <input 
                  type="text" 
                  placeholder="Service Title"
                  value={newService.title || ''} 
                  onChange={e => setNewService({...newService, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                />
                <textarea 
                  placeholder="Service Description"
                  value={newService.description || ''} 
                  onChange={e => setNewService({...newService, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-24 text-white focus:border-accent/50 outline-none"
                />
                <button 
                  onClick={handleAddService}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Service
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {services.map(service => (
                <div key={service.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <input 
                    type="text" 
                    value={service.title || ''} 
                    onChange={e => handleUpdateService(service.id!, { title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white"
                  />
                  <textarea 
                    value={service.description || ''} 
                    onChange={e => handleUpdateService(service.id!, { description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 text-white"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDeleteService(service.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Experience</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'experience' ? null : 'experience')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'experience' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'experience' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'experience' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Company"
                    value={newExperience.company || ''} 
                    onChange={e => setNewExperience({...newExperience, company: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Position"
                    value={newExperience.position || ''} 
                    onChange={e => setNewExperience({...newExperience, position: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Period (e.g., 2023 - Present)"
                  value={newExperience.period || ''} 
                  onChange={e => setNewExperience({...newExperience, period: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                />
                <textarea 
                  placeholder="Job Description"
                  value={newExperience.description || ''} 
                  onChange={e => setNewExperience({...newExperience, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-24 text-white focus:border-accent/50 outline-none"
                />
                <button 
                  onClick={handleAddExperience}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Experience
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {experiences.map(exp => (
                <div key={exp.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Company"
                      value={exp.company || ''} 
                      onChange={e => handleUpdateExperience(exp.id!, { company: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Position"
                      value={exp.position || ''} 
                      onChange={e => handleUpdateExperience(exp.id!, { position: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Period"
                      value={exp.period || ''} 
                      onChange={e => handleUpdateExperience(exp.id!, { period: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <textarea 
                    value={exp.description || ''} 
                    onChange={e => handleUpdateExperience(exp.id!, { description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 text-white"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDeleteExperience(exp.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Testimonials</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'testimonials' ? null : 'testimonials')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'testimonials' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'testimonials' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'testimonials' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Testimonial
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Client Name"
                    value={newTestimonial.name || ''} 
                    onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Client Role"
                    value={newTestimonial.role || ''} 
                    onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Avatar URL"
                  value={newTestimonial.avatar || ''} 
                  onChange={e => setNewTestimonial({...newTestimonial, avatar: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                />
                <textarea 
                  placeholder="Testimonial Content"
                  value={newTestimonial.content || ''} 
                  onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-24 text-white focus:border-accent/50 outline-none"
                />
                <button 
                  onClick={handleAddTestimonial}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Testimonial
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <input 
                        type="text" 
                        placeholder="Client Name"
                        value={testimonial.name || ''} 
                        onChange={e => handleUpdateTestimonial(testimonial.id!, { name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Client Role"
                        value={testimonial.role || ''} 
                        onChange={e => handleUpdateTestimonial(testimonial.id!, { role: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      {testimonial.avatar && (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Avatar URL"
                    value={testimonial.avatar || ''} 
                    onChange={e => handleUpdateTestimonial(testimonial.id!, { avatar: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                  <textarea 
                    value={testimonial.content || ''} 
                    onChange={e => handleUpdateTestimonial(testimonial.id!, { content: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 text-white"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDeleteTestimonial(testimonial.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Stats</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'stats' ? null : 'stats')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'stats' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'stats' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'stats' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New Stat
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Stat Label (e.g., Projects Done)"
                    value={newStat.label || ''} 
                    onChange={e => setNewStat({...newStat, label: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Stat Value (e.g., 50+)"
                    value={newStat.value || ''} 
                    onChange={e => setNewStat({...newStat, value: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Lucide Icon Name"
                    value={newStat.icon || ''} 
                    onChange={e => setNewStat({...newStat, icon: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <button 
                  onClick={handleAddStat}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save Stat
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map(stat => (
                <div key={stat.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <input 
                    type="text" 
                    placeholder="Label (e.g. Projects)"
                    value={stat.label || ''} 
                    onChange={e => handleUpdateStat(stat.id!, { label: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Value (e.g. 50+)"
                    value={stat.value || ''} 
                    onChange={e => handleUpdateStat(stat.id!, { value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Lucide Icon Name"
                    value={stat.icon || ''} 
                    onChange={e => handleUpdateStat(stat.id!, { icon: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDeleteStat(stat.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage FAQs</h3>
              <button 
                onClick={() => setShowAddForm(showAddForm === 'faqs' ? null : 'faqs')}
                className={`p-3 rounded-xl transition-all ${showAddForm === 'faqs' ? 'bg-white/10 text-white' : 'bg-accent text-black hover:opacity-90 shadow-md shadow-accent/20'}`}
              >
                {showAddForm === 'faqs' ? <X size={20} /> : <Plus size={20} />}
              </button>
            </div>

            {showAddForm === 'faqs' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4"
              >
                <h4 className="text-accent font-bold flex items-center gap-2">
                  <Plus size={18} /> Add New FAQ
                </h4>
                <input 
                  type="text" 
                  placeholder="Question"
                  value={newFAQ.question || ''} 
                  onChange={e => setNewFAQ({...newFAQ, question: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-accent/50 outline-none"
                />
                <textarea 
                  placeholder="Answer"
                  value={newFAQ.answer || ''} 
                  onChange={e => setNewFAQ({...newFAQ, answer: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-24 text-white focus:border-accent/50 outline-none"
                />
                <button 
                  onClick={handleAddFAQ}
                  className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Save size={20} /> Save FAQ
                </button>
              </motion.div>
            )}

            <div className="space-y-6">
              {faqs.map(faq => (
                <div key={faq.id} className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                  <input 
                    type="text" 
                    placeholder="Question"
                    value={faq.question || ''} 
                    onChange={e => handleUpdateFAQ(faq.id!, { question: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white"
                  />
                  <textarea 
                    placeholder="Answer"
                    value={faq.answer || ''} 
                    onChange={e => handleUpdateFAQ(faq.id!, { answer: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 text-white"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDeleteFAQ(faq.id!)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Announcement</h3>
            </div>
            <form onSubmit={handleSaveAnnouncement} className="p-8 bg-black/40 border border-white/10 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={announcement.isActive}
                  onChange={e => setAnnouncement({...announcement, isActive: e.target.checked})}
                  className="w-5 h-5 accent-accent"
                />
                <label htmlFor="isActive" className="text-white font-medium cursor-pointer">Show Announcement Bar</label>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Announcement Text</label>
                <input 
                  type="text" 
                  value={announcement.text || ''}
                  onChange={e => setAnnouncement({...announcement, text: e.target.value})}
                  placeholder="e.g. Open for new projects! Contact now."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-accent/50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Link (Optional)</label>
                <input 
                  type="text" 
                  value={announcement.link || ''}
                  onChange={e => setAnnouncement({...announcement, link: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white focus:border-accent/50"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-accent text-black font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Save size={20} /> Save Announcement
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
