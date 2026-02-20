import React from 'react';
import { motion } from 'framer-motion';

export default function CategoryCard({ category, onClick, selected }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group h-48 ${
        selected ? 'ring-4 ring-emerald-500 ring-offset-2' : ''
      }`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="text-white font-bold text-lg">{category.name}</h3>
        </div>
        <p className="text-white/70 text-sm">{category.description}</p>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}