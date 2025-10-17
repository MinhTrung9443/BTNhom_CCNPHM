'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component để render particles chỉ ở client-side
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * window.innerWidth;
        const randomY = window.innerHeight + 50;
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 3;

        return (
          <motion.div
            key={i}
            initial={{
              x: randomX,
              y: randomY,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: -100,
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'linear',
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? '#00f2ea' : i % 3 === 1 ? '#ffffff' : '#ff0050',
              boxShadow: `0 0 8px ${i % 3 === 0 ? '#00f2ea' : i % 3 === 1 ? '#ffffff' : '#ff0050'}`,
            }}
          />
        );
      })}
    </>
  );
}

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    // Hide preloader after loading complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
          }}
          transition={{
            duration: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 242, 234, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 0, 80, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div className="relative mb-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-2xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00f2ea] to-[#ff0050] font-bold text-3xl">
                  ST
                </span>
              </div>
            </div>

            {/* Brand name */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Đặc Sản Sóc Trăng
              </h1>
              <p className="text-white/60 text-sm tracking-wider">
                Hương vị truyền thống miền Tây
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-64 mb-4">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00f2ea] to-[#ff0050] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/40 text-xs text-center mt-2 font-mono">
                {Math.round(Math.min(progress, 100))}%
              </p>
            </div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i === 0 ? '#00f2ea' : i === 1 ? '#ffffff' : '#ff0050',
                    boxShadow: `0 0 10px ${i === 0 ? '#00f2ea' : i === 1 ? '#ffffff' : '#ff0050'}`,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Subtle ambient glow */}
          <motion.div
            animate={{
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 242, 234, 0.1) 0%, transparent 40%, rgba(255, 0, 80, 0.1) 100%)',
            }}
          />

          {/* Floating particles */}
          <FloatingParticles />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
