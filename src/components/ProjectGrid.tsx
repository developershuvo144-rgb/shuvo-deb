import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, Code2, Bot, Database, Globe, Search, X, ChevronRight, Layers, Calendar, Tag } from 'lucide-react';
import { Project } from '../types';

interface ProjectGridProps {
  projects: Project[];
}

const categoryIcons = {
  VBA: <Database size={18} />,
  Bot: <Bot size={18} />,
  ERP: <Code2 size={18} />,
  Web: <Globe size={18} />,
};

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (project.technologies?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem]">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search projects, tech, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-accent/50 transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-accent text-black font-bold shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-accent text-black font-bold shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedProject(project)}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-video overflow-hidden bg-black/40 relative">
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    {categoryIcons[project.category]}
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5 text-[10px] font-mono text-accent uppercase tracking-widest">
                  {categoryIcons[project.category]}
                  {project.category}
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-medium text-white group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {(project.technologies || project.tags)?.slice(0, 3).map(tech => (
                    <span key={tech} className="text-[8px] font-mono text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">
                      {tech}
                    </span>
                  ))}
                  {(project.technologies || project.tags)?.length > 3 && (
                    <span className="text-[8px] font-mono text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-md">
                      +{(project.technologies || project.tags).length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
            <Search size={32} />
          </div>
          <p className="text-white/40 font-mono uppercase tracking-widest">No projects found matching your search.</p>
        </div>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-accent/10"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto custom-scrollbar">
                <div className="aspect-video md:aspect-[21/9] w-full relative">
                  <img 
                    src={selectedProject.image || 'https://picsum.photos/seed/project/1200/600'} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-accent text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                        {selectedProject.category}
                      </div>
                      {selectedProject.createdAt && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          <Calendar size={12} />
                          {new Date(selectedProject.createdAt?.seconds * 1000).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{selectedProject.title}</h2>
                  </div>
                </div>

                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-accent">
                        <Layers size={20} /> Overview
                      </h3>
                      <p className="text-white/60 leading-relaxed text-lg">
                        {selectedProject.longDescription || selectedProject.description}
                      </p>
                    </div>

                    {selectedProject.features && selectedProject.features.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-accent">
                          <ChevronRight size={20} /> Key Features
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProject.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white/70">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-accent">
                          <Globe size={20} /> Gallery
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedProject.gallery.map((img, i) => (
                            <img 
                              key={i} 
                              src={img} 
                              alt={`Gallery ${i}`} 
                              className="rounded-2xl border border-white/10 hover:border-accent/30 transition-all cursor-zoom-in"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Tag size={14} /> Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedProject.technologies || selectedProject.tags || []).map(tech => (
                            <span key={tech} className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono uppercase tracking-widest rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest">Links</h4>
                        <div className="flex flex-col gap-3">
                          {selectedProject.githubUrl && (
                            <a 
                              href={selectedProject.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold"
                            >
                              <Github size={18} /> Source Code
                            </a>
                          )}
                          {selectedProject.liveUrl && (
                            <a 
                              href={selectedProject.liveUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-3 bg-accent text-black rounded-xl hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-accent/20"
                            >
                              <ExternalLink size={18} /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
