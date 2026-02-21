import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#FDFDFC] dark:bg-[#0a0a0a]">
            {/* Ambient gradients with breathing animation */}
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} 
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[100px] dark:bg-orange-500/10 mix-blend-multiply dark:mix-blend-screen" 
            />
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} 
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-rose-500/20 blur-[100px] dark:bg-rose-500/10 mix-blend-multiply dark:mix-blend-screen" 
            />
            <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }} 
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/20 blur-[120px] dark:bg-violet-500/10 mix-blend-multiply dark:mix-blend-screen" 
            />

            {/* Subtle moving particles */}
            <motion.div
                animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[30%] left-[15%] w-2 h-2 rounded-full bg-orange-400 blur-[1px]"
            />
            <motion.div
                animate={{
                    y: [0, 40, 0],
                    x: [0, -25, 0],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 2, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[60%] right-[25%] w-3 h-3 rounded-full bg-violet-400 blur-[2px]"
            />
            <motion.div
                animate={{
                    y: [0, -50, 0],
                    x: [0, 30, 0],
                    opacity: [0.1, 0.5, 0.1],
                    scale: [1, 1.5, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                className="absolute bottom-[20%] left-[40%] w-4 h-4 rounded-full bg-rose-400 blur-[2px]"
            />
            <motion.div
                animate={{
                    y: [0, 60, 0],
                    x: [0, -40, 0],
                    opacity: [0.2, 0.7, 0.2],
                    scale: [0.8, 1.8, 0.8]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[15%] right-[40%] w-2 h-2 rounded-full bg-amber-400 blur-[1px]"
            />
            <motion.div
                animate={{
                    y: [0, -35, 0],
                    x: [0, -20, 0],
                    opacity: [0.1, 0.6, 0.1],
                    scale: [1, 2.5, 1]
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute bottom-[30%] right-[15%] w-5 h-5 rounded-full bg-fuchsia-400 blur-[3px]"
            />
            
            {/* Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTI4LCAxMjgsIDEyOCwgMC4xKSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>
    );
}
