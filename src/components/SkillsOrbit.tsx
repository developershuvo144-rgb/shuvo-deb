import React from 'react';
import { motion } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Skill } from '../types';

interface SkillsOrbitProps {
  skills: Skill[];
}

export const SkillsOrbit: React.FC<SkillsOrbitProps> = ({ skills }) => {
  // Group skills by category and get top 6-8 for the radar chart
  const radarData = skills
    .sort((a, b) => b.level - a.level)
    .slice(0, 8)
    .map(s => ({
      subject: s.name,
      A: s.level,
      fullMark: 100,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-1">{payload[0].payload.subject}</p>
          <p className="text-lg font-bold text-white">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="h-[400px] w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skill Level"
              dataKey="A"
              stroke="var(--accent-color)"
              fill="var(--accent-color)"
              fillOpacity={0.3}
              animationDuration={1500}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Expertise Radar</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Top 8 Core Competencies</p>
          </div>
          <div className="w-12 h-12 rounded-full border border-accent/20 flex items-center justify-center text-accent animate-pulse">
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent-color)]" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl group hover:border-accent/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white group-hover:text-accent transition-colors">{skill.name}</span>
              <span className="text-[10px] font-mono text-white/40">{skill.level}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="h-full bg-accent shadow-[0_0_10px_var(--accent-color)]"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
