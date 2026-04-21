// FILE ROLE: Marketing Social Proof Card (Injection Component)
// DEPENDS ON: THEME tokens, framer-motion
// CONSUMED BY: ProductGrid.tsx
import { motion } from 'framer-motion';
import { THEME } from '../data/config';

interface SocialProofCardProps {
  message: string;
  isAdmin?: boolean;
  onEdit?: (val: string) => void;
}

export default function SocialProofCard({ message, isAdmin, onEdit }: SocialProofCardProps) {
  const cardTheme = THEME.productCard;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`
        aspect-[4/5] sm:aspect-auto sm:h-full w-full 
        bg-stone-50 border border-stone-100 rounded-[var(--radius-card)] 
        flex flex-col items-center justify-center p-6 text-center group relative
        shadow-sm hover:shadow-md transition-all duration-300
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Placeholder Emoji/Icon from message */}
        <div className="text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform duration-500">
           {message.split(' ')[0]}
        </div>
        
        <p 
          className="text-stone-900 font-black text-sm sm:text-base uppercase tracking-tight leading-snug"
          contentEditable={isAdmin}
          suppressContentEditableWarning
          onBlur={(e) => onEdit?.(e.currentTarget.textContent || '')}
        >
          {message.split(' ').slice(1).join(' ')}
        </p>

        <div className="w-10 h-0.5 bg-stone-200 mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
      </div>

      {isAdmin && (
        <div className="absolute top-2 right-2 bg-stone-900 text-[8px] text-white px-2 py-1 rounded-full font-black opacity-0 group-hover:opacity-100 transition-opacity">
          BİLGİ KARTI (DÜZENLE)
        </div>
      )}
    </motion.div>
  );
}
