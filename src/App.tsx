import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from './components/Terminal';
import { ProjectGrid } from './components/ProjectGrid';
import { SkillsOrbit } from './components/SkillsOrbit';
import { ChatBot } from './components/ChatBot';
import { AdminPanel } from './components/AdminPanel';
import { CommandPalette } from './components/CommandPalette';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Project, Profile, Skill, Service, Experience, Testimonial, Stat, FAQ, Announcement, SiteSettings, OperationType } from './types';
import { handleFirestoreError } from './utils/error-handler';
import { 
  Code2, 
  Layout, 
  User, 
  Mail, 
  MapPin, 
  Download, 
  Github, 
  Linkedin, 
  Facebook,
  Settings,
  ArrowRight,
  Cpu,
  Briefcase,
  Wrench,
  Phone,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  History,
  BarChart3,
  HelpCircle,
  Megaphone,
  ChevronDown,
  Languages,
  Sparkles,
  Shield
} from 'lucide-react';

const translations = {
  en: {
    nav: {
      about: 'About',
      projects: 'Projects',
      services: 'Services',
      experience: 'Experience',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      skills: 'Skills',
      contact: 'Contact'
    },
    hero: {
      greeting: "Hi, I'm",
      cta: "Let's Talk",
      cv: 'Download CV'
    }
  },
  bn: {
    nav: {
      about: 'সম্পর্কে',
      projects: 'প্রজেক্ট',
      services: 'সেবা',
      experience: 'অভিজ্ঞতা',
      testimonials: 'মতামত',
      faq: 'প্রশ্নাবলী',
      skills: 'দক্ষতা',
      contact: 'যোগাযোগ'
    },
    hero: {
      greeting: 'হাই, আমি',
      cta: 'কথা বলি',
      cv: 'সিভি ডাউনলোড'
    }
  }
};

const CustomCursor = ({ color }: { color: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isPointer ? 2.5 : 1,
        backgroundColor: isPointer ? color : 'white'
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
    />
  );
};

const NoiseEffect = () => (
  <div className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.03] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const t = translations[lang];
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
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const projectsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        setSettings(data);
        if (data.defaultLanguage) setLang(data.defaultLanguage);
      } else {
        setDoc(doc(db, 'settings', 'main'), {
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
      }
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
  }, []);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      const settingsRef = doc(db, 'settings', 'main');
      getDoc(settingsRef).then(snap => {
        if (snap.exists()) {
          const currentCount = snap.data().visitorCount || 0;
          updateDoc(settingsRef, { visitorCount: currentCount + 1 });
          sessionStorage.setItem('hasVisited', 'true');
        }
      });
    }
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTerminalCommand = (cmd: string) => {
    if (cmd === 'projects') scrollTo(projectsRef);
    if (cmd === 'skills') scrollTo(skillsRef);
    if (cmd === 'about') scrollTo(aboutRef);
    if (cmd === 'services') scrollTo(servicesRef);
    if (cmd === 'experience') scrollTo(experienceRef);
    if (cmd === 'testimonials') scrollTo(testimonialsRef);
    if (cmd === 'faq') scrollTo(faqRef);
    if (cmd === 'contact') scrollTo(contactRef);
    if (cmd === 'admin') setView('admin');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-accent/30 selection:text-accent">
      {settings.isMaintenanceMode && view !== 'admin' && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent">
              <Shield size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white">Maintenance Mode</h1>
            <p className="text-white/60 leading-relaxed">
              We are currently performing some scheduled maintenance. We will be back shortly. Thank you for your patience.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => setView('admin')}
                className="text-xs font-mono text-white/20 hover:text-accent transition-colors uppercase tracking-widest"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        :root {
          --accent-color: ${settings.accentColor};
        }
      `}</style>

      {settings.enableCustomCursor && <CustomCursor color={settings.accentColor} />}
      {settings.enableNoiseEffect && <NoiseEffect />}

      <CommandPalette onNavigate={(id) => {
        const refs: Record<string, React.RefObject<HTMLDivElement>> = {
          about: aboutRef,
          projects: projectsRef,
          services: servicesRef,
          experience: experienceRef,
          testimonials: testimonialsRef,
          faq: faqRef,
          skills: skillsRef,
          contact: contactRef,
          terminal: { current: document.querySelector('.terminal-container') } as any
        };
        if (refs[id]) scrollTo(refs[id]);
      }} onAdmin={() => setView('admin')} />
      
      {/* Announcement Bar */}
      <AnimatePresence>
        {announcement.isActive && announcement.text && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-accent text-black py-2 px-6 text-center text-xs font-bold uppercase tracking-widest relative z-50 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-4 animate-marquee whitespace-nowrap">
              <span>{announcement.text}</span>
              {announcement.link && (
                <a href={announcement.link} className="underline hover:opacity-80 transition-opacity flex items-center gap-1">
                  Learn More <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-bold group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="font-mono text-sm tracking-tighter font-bold uppercase">Dhrubojyoti.dev</span>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            <button onClick={() => scrollTo(aboutRef)} className="hover:text-accent transition-colors">{t.nav.about}</button>
            <button onClick={() => scrollTo(servicesRef)} className="hover:text-accent transition-colors">{t.nav.services}</button>
            <button onClick={() => scrollTo(projectsRef)} className="hover:text-accent transition-colors">{t.nav.projects}</button>
            <button onClick={() => scrollTo(experienceRef)} className="hover:text-accent transition-colors">{t.nav.experience}</button>
            {settings.showTestimonials && <button onClick={() => scrollTo(testimonialsRef)} className="hover:text-accent transition-colors">{t.nav.testimonials}</button>}
            {settings.showFAQ && <button onClick={() => scrollTo(faqRef)} className="hover:text-accent transition-colors">{t.nav.faq}</button>}
            <button onClick={() => scrollTo(skillsRef)} className="hover:text-accent transition-colors">{t.nav.skills}</button>
            <button onClick={() => scrollTo(contactRef)} className="hover:text-accent transition-colors">{t.nav.contact}</button>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono hover:bg-white/10 transition-all"
            >
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button onClick={() => setView('admin')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-accent">
              <Settings size={16} />
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono"
            >
              {lang.toUpperCase()}
            </button>
            <button 
              onClick={() => setView('admin')} 
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-accent"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/90 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                  {[
                    { label: 'About', ref: aboutRef },
                    { label: 'Services', ref: servicesRef },
                    { label: 'Projects', ref: projectsRef },
                    { label: 'Experience', ref: experienceRef },
                    ...(settings.showTestimonials ? [{ label: 'Testimonials', ref: testimonialsRef }] : []),
                    ...(settings.showFAQ ? [{ label: 'FAQ', ref: faqRef }] : []),
                    { label: 'Skills', ref: skillsRef },
                    { label: 'Contact', ref: contactRef }
                  ].map(item => (
                    <button 
                      key={item.label}
                      onClick={() => {
                        scrollTo(item.ref);
                        setIsMobileMenuOpen(false);
                      }} 
                      className="hover:text-accent transition-colors text-left py-2 border-b border-white/5"
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-40"
            >
              {/* Hero Section */}
              <section className="space-y-12">
                <div className="max-w-4xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-6"
                  >
                    <Cpu size={12} /> Available for projects
                  </motion.div>
                  <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.85] mb-8">
                    {t.hero.greeting} <span className="text-accent">Dhrubojyoti</span> <br />
                    deb shuvo.
                  </h1>
                  <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl font-light">
                    {profile?.tagline || 'Building intelligent digital experiences with precision and purpose.'}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-12">
                    <button onClick={() => scrollTo(contactRef)} className="px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:bg-accent/80 transition-all flex items-center gap-2">
                      {t.hero.cta} <ArrowRight size={18} />
                    </button>
                    <a href={profile?.cvUrl || '#'} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-accent hover:text-accent/80 transition-colors">
                      <Download size={14} /> {t.hero.cv}
                    </a>
                  </div>
                </div>

                {settings.showTerminal && <Terminal onCommand={handleTerminalCommand} />}
              </section>

              {/* About Section */}
              <section ref={aboutRef} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={profile?.profileImage || 'https://picsum.photos/seed/shuvo/800/800'} 
                    alt="Dhrubojyoti deb shuvo"
                    className="relative rounded-full w-full aspect-square object-cover border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono text-accent uppercase tracking-widest mb-1">Based in</p>
                        <p className="text-lg font-medium">{profile?.address || 'Habiganj, Bangladesh'}</p>
                      </div>
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black">
                        <MapPin size={24} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold">About Me</h2>
                    <div className="h-1 w-20 bg-accent rounded-full" />
                  </div>
                  <p className="text-lg text-white/60 leading-relaxed whitespace-pre-line">
                    {profile?.aboutMe || 'I am a passionate full-stack developer with a focus on creating seamless, intelligent digital experiences. With expertise in React, Node.js, and various automation tools, I strive to build solutions that are not only functional but also elegant and efficient.'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {stats.length > 0 ? stats.map(stat => (
                      <div key={stat.id}>
                        <p className="text-3xl font-bold text-accent">{stat.value}</p>
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{stat.label}</p>
                      </div>
                    )) : (
                      <>
                        <div>
                          <p className="text-3xl font-bold text-accent">5+</p>
                          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Years Experience</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-accent">50+</p>
                          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Projects Completed</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              {settings.showStats && (
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:border-accent/30 transition-all group">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform">
                        <BarChart3 size={24} />
                      </div>
                      <p className="text-3xl font-bold text-accent">{stat.value}</p>
                      <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* Services Section */}
              <section ref={servicesRef} className="space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">Services</h2>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">What I can do for you</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {services.length > 0 ? services.map((service) => (
                    <div key={service.id} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:border-accent/50 transition-all group">
                      <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                        <Wrench size={28} />
                      </div>
                      <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                      <p className="text-white/60 leading-relaxed text-sm">{service.description}</p>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-20 text-white/20 font-mono uppercase tracking-widest">
                      No services listed yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Projects Section */}
              <section ref={projectsRef} className="space-y-12">
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-bold">Featured Projects</h2>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Selected works & experiments</p>
                  </div>
                  <div className="h-px flex-1 bg-white/5 mx-8 mb-3 hidden md:block" />
                </div>
                <ProjectGrid projects={projects} />
              </section>

              {/* Experience Section */}
              <section ref={experienceRef} className="space-y-16">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">Experience</h2>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">My professional journey</p>
                </div>
                <div className="space-y-8">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-8 md:pl-12 border-l border-white/10 pb-8 last:pb-0">
                      <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-accent rounded-full shadow-[0_0_10px_var(--accent-color)]" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <p className="text-accent font-mono text-sm">{exp.period}</p>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <h3 className="text-xl font-bold">{exp.position}</h3>
                          <p className="text-white/40 font-medium">{exp.company}</p>
                          <p className="text-white/60 leading-relaxed text-sm mt-4">{exp.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Testimonials Section */}
              {settings.showTestimonials && (
                <section ref={testimonialsRef} className="space-y-16">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold">Testimonials</h2>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">What clients say</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative group">
                        <div className="absolute top-8 right-8 text-accent/20 group-hover:text-accent/40 transition-colors">
                          <Mail size={48} />
                        </div>
                        <p className="text-lg text-white/80 leading-relaxed mb-8 italic">
                          "{testimonial.content}"
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                            <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{testimonial.name}</h4>
                            <p className="text-xs text-white/40 font-mono uppercase tracking-widest">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills Section */}
              <section ref={skillsRef} className="space-y-12">
                <div className="space-y-2">
                  <h2 className="text-4xl md:text-5xl font-bold">Technical Arsenal</h2>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Technologies I master</p>
                </div>
                <SkillsOrbit skills={skills} />
              </section>

              {/* FAQ Section */}
              {settings.showFAQ && faqs.length > 0 && (
                <section ref={faqRef} className="space-y-16">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold">FAQ</h2>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Common questions answered</p>
                  </div>
                  <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq) => (
                      <div 
                        key={faq.id} 
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-accent/30"
                      >
                        <button 
                          onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                          className="w-full p-6 text-left flex items-center justify-between group"
                        >
                          <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.question}</span>
                          <ChevronDown 
                            size={20} 
                            className={`text-white/40 transition-transform duration-300 ${openFaqId === faq.id ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        <AnimatePresence>
                          {openFaqId === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 text-white/60 leading-relaxed border-t border-white/5 bg-white/2">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Contact Section */}
              <section ref={contactRef} className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-16">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 blur-[100px] -z-10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                        Let's build something <br />
                        <span className="text-accent">extraordinary</span> together.
                      </h2>
                      <p className="text-white/60 text-lg leading-relaxed">
                        Have a project in mind? Or just want to say hi? <br />
                        Feel free to reach out.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 group">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-all">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-lg font-medium">{profile?.address || 'Habiganj, Bangladesh'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 group">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-all">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Email</p>
                          <p className="text-lg font-medium">{profile?.email || 'developershuvo144@gmail.com'}</p>
                        </div>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-6 group">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-all">
                            <Phone size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Phone</p>
                            <p className="text-lg font-medium">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {profile?.githubUrl && (
                        <a href={profile.githubUrl} className="p-4 bg-white/5 rounded-2xl hover:bg-accent/20 hover:text-accent transition-all">
                          <Github size={24} />
                        </a>
                      )}
                      {profile?.linkedinUrl && (
                        <a href={profile.linkedinUrl} className="p-4 bg-white/5 rounded-2xl hover:bg-accent/20 hover:text-accent transition-all">
                          <Linkedin size={24} />
                        </a>
                      )}
                      {profile?.facebookUrl && (
                        <a href={profile.facebookUrl} className="p-4 bg-white/5 rounded-2xl hover:bg-accent/20 hover:text-accent transition-all">
                          <Facebook size={24} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] space-y-8">
                    <h3 className="text-2xl font-bold">Send a Message</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent/50" />
                        <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent/50" />
                      </div>
                      <input type="text" placeholder="Subject" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent/50" />
                      <textarea placeholder="Message" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent/50 h-40" />
                      <button className="w-full py-5 bg-accent text-black font-bold rounded-2xl hover:bg-accent/80 transition-all flex items-center justify-center gap-2 text-lg">
                        Send Message <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl mx-auto"
            >
              <AdminPanel onBack={() => setView('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ChatBot 
        projects={projects} 
        bio={profile?.bio || 'Full-stack developer from Habiganj.'} 
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-bold">D</div>
                <span className="font-mono text-sm font-bold uppercase tracking-tighter">Dhrubojyoti.dev</span>
              </div>
              <p className="text-white/20 text-xs font-mono uppercase tracking-[0.2em]">
                © 2026 Dhrubojyoti deb shuvo. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
              <button onClick={() => scrollTo(aboutRef)} className="hover:text-accent transition-colors">About</button>
              <button onClick={() => scrollTo(servicesRef)} className="hover:text-accent transition-colors">Services</button>
              <button onClick={() => scrollTo(projectsRef)} className="hover:text-accent transition-colors">Projects</button>
              {settings.showTestimonials && <button onClick={() => scrollTo(testimonialsRef)} className="hover:text-accent transition-colors">Testimonials</button>}
              {settings.showFAQ && <button onClick={() => scrollTo(faqRef)} className="hover:text-accent transition-colors">FAQ</button>}
              <button onClick={() => scrollTo(contactRef)} className="hover:text-accent transition-colors">Contact</button>
            </div>

            <div className="flex items-center gap-6">
              <a href={profile?.cvUrl || '#'} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-accent hover:text-accent/80 transition-colors">
                <Download size={14} /> Download CV
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
