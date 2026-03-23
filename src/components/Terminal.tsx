import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, ChevronRight, Command } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'system';
}

interface TerminalProps {
  onCommand: (cmd: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onCommand }) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialLines = [
    { text: 'Initializing portfolio system...', type: 'system' as const },
    { text: 'npm install skills... done', type: 'system' as const },
    { text: 'npm install projects... done', type: 'system' as const },
    { text: 'Loading AI Assistant... ready', type: 'system' as const },
    { text: 'Welcome to Shuvo\'s Interactive Portfolio. Type "help" to see commands.', type: 'output' as const },
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < initialLines.length) {
        setLines(prev => [...prev, initialLines[currentLine]]);
        currentLine++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setLines(prev => [...prev, { text: input, type: 'input' }]);
    
    // Local command handling
    if (cmd === 'help') {
      setLines(prev => [...prev, { text: 'Available commands: help, projects, skills, contact, about, clear', type: 'output' }]);
    } else if (cmd === 'clear') {
      setLines([]);
    } else {
      onCommand(cmd);
    }

    setInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl font-mono text-sm h-[400px] flex flex-col">
      <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-bottom border-white/10">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-accent" />
          <span className="text-white/60 text-xs uppercase tracking-widest">Portfolio CLI v1.0</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-hide">
        <AnimatePresence>
          {lines.map((line, i) => line && (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 ${
                line?.type === 'input' ? 'text-white' : 
                line?.type === 'system' ? 'text-accent/80' : 'text-accent'
              }`}
            >
              {line?.type === 'input' && <ChevronRight size={14} className="mt-1 shrink-0" />}
              <span className="break-all">{line?.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {!isTyping && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-accent shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full caret-accent"
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
};
