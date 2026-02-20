import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection({ onActionSelect }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900/85 to-slate-900/90" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              UMUHUZA
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl mx-auto">
            Urubuga rwo Kugura no Gukodesha mu Rwanda
          </p>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto">
            The Ultimate Marketplace for Buying & Renting in Rwanda
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            onClick={() => onActionSelect('buy')}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 group"
          >
            <ShoppingBag className="w-7 h-7 mr-3 group-hover:animate-bounce" />
            Kugura
            <span className="ml-2 text-emerald-200 text-sm">(Buy)</span>
          </Button>

          <Button
            onClick={() => onActionSelect('rent')}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 group"
          >
            <Key className="w-7 h-7 mr-3 group-hover:animate-bounce" />
            Gukodesha
            <span className="ml-2 text-blue-200 text-sm">(Rent)</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-white/60"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white">1000+</div>
            <div className="text-sm">Ibicuruzwa</div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm">Abaguzi</div>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">6</div>
            <div className="text-sm">Kategori</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}