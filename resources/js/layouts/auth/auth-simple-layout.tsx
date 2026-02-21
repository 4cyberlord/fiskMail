import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { motion } from 'framer-motion';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <AnimatedBackground />
            <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10 selection:bg-rose-500/30">
                <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                        duration: 0.6
                    }}
                    className="w-full max-w-[440px]"
                >
                    <div className="flex flex-col gap-10 rounded-[2rem] bg-white/70 p-10 md:p-12 shadow-2xl shadow-rose-500/10 backdrop-blur-2xl border border-white/50 dark:border-white/10 dark:bg-black/40">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <Link
                                href={home()}
                                className="group flex flex-col items-center gap-2 font-medium transition-transform hover:scale-105 active:scale-95"
                            >
                                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-600 shadow-xl shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-shadow">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">{title}</h1>
                                <p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    {description}
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </motion.div>
                
                <footer className="absolute bottom-6 w-full text-center text-xs font-medium text-zinc-500/80 dark:text-zinc-500 z-10">
                    <p>© {new Date().getFullYear()} FiskMail. Built with Laravel 12.</p>
                </footer>
            </div>
        </>
    );
}
