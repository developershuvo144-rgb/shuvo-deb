import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Command as CommandIcon, 
  Home, 
  User, 
  Briefcase, 
  Wrench, 
  History, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  ArrowRight,
  Terminal
} from 'lucide-react';

interface CommandPaletteProps {
  onNavigate: (section: string) => void;
  onAdmin: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate, onAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: 'home', label: 'Go to Home', icon: Home, category: 'Navigation' },
    { id: 'about', label: 'About Me', icon: User, category: 'Navigation' },
    { id: 'projects', label: 'View Projects', icon: Briefcase, category: 'Navigation' },
    { id: 'services', label: 'Services Offered', icon: Wrench, category: 'Navigation' },
    { id: 'experience', label: 'Experience Timeline', icon: History, category: 'Navigation' },
    { id: 'testimonials', label: 'Client Testimonials', icon: MessageSquare, category: 'Navigation' },
    { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle, category: 'Navigation' },
    { id: 'admin', label: 'Admin Dashboard', icon: Settings, category: 'System' },
    { id: 'terminal', label: 'Open Terminal', icon: Terminal, category: 'System' },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const executeAction = (id: string) => {
    if (id === 'admin') onAdmin();
    else if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else onNavigate(id);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="text-white/40 mr-3" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-white/40">
                <CommandIcon size={12} />
                <span>K</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length > 0 ? (
                <div className="space-y-4 py-2">
                  {['Navigation', 'System'].map(category => {
                    const categoryActions = filteredActions.filter(a => a.category === category);
                    if (categoryActions.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-1">
                        <h3 className="px-3 text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">
                          {category}
                        </h3>
                        {categoryActions.map((action, index) => (
                          <button
                            key={action.id}
                            onClick={() => executeAction(action.id)}
                            className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                                <action.icon size={18} />
                              </div>
                              <span className="text-sm text-white/70 group-hover:text-white font-medium">
                                {action.label}
                              </span>
                            </div>
                            <ArrowRight size={14} className="text-white/0 group-hover:text-accent -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <p className="text-white/40 text-sm">No results found for "{query}"</p>
                  <p className="text-white/20 text-xs">Try searching for something else</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-white/2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40">↑↓</span> Navigate</span>
                <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40">Enter</span> Select</span>
              </div>
              <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40">Esc</span> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
