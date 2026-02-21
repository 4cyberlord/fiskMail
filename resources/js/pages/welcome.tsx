import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

    const openAuthModal = (view: 'login' | 'register') => {
        setAuthView(view);
        setIsAuthModalOpen(true);
    };

    return (
        <>
            <Head title="Welcome to FiskMail">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            
            <AnimatedBackground />

            <div className="flex min-h-screen flex-col items-center p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:text-[#EDEDEC] relative z-10 selection:bg-rose-500/30">
                <header className="absolute top-0 w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex items-center gap-2"
                    >
                        {/* Logo Mark */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight dark:text-white">Fisk<span className="text-rose-500 font-semibold">Mail</span></span>
                    </motion.div>
                    
                    <motion.nav 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex items-center gap-4"
                    >
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center h-10 rounded-full bg-black/5 px-6 text-sm font-medium transition-all hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 backdrop-blur-md"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium transition-all hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer"
                                >
                                    Log in
                                </button>
                                {canRegister && (
                                    <button
                                        onClick={() => openAuthModal('register')}
                                        className="inline-flex items-center justify-center h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 px-6 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40 hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        Register
                                    </button>
                                )}
                            </>
                        )}
                    </motion.nav>
                </header>

                <main className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto pt-32 lg:pt-20 pb-32 px-4">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="text-center w-full max-w-4xl mb-24"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium mb-8 border border-rose-500/20 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            Secure & Reliable
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60 leading-[1.1]">
                            Fisk University's <br className="hidden lg:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">Modern Mail</span>
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            A secure, fast, and unified communication platform designed exclusively for Fisk University.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={() => openAuthModal('register')}
                                className="w-full sm:w-auto inline-flex items-center justify-center h-12 rounded-full bg-black px-8 text-base font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/10 cursor-pointer"
                            >
                                Create Account
                                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full"
                    >
                        {[
                            {
                                title: "Secure Access",
                                description: "Enterprise-grade security and authentication protocols keeping your data safe.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Lightning Fast",
                                description: "Seamless, instant transitions providing a perfectly fluid user experience.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Intuitive Interface",
                                description: "Beautifully crafted layouts that make managing your email completely effortless.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                )
                            }
                        ].map((feature, i) => (
                            <motion.div variants={itemVariants} key={i}>
                                <motion.div 
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                                    whileHover={{ y: -20, scale: 1.03, transition: { duration: 0.2 } }}
                                    className="group h-full p-10 rounded-[2rem] bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-2xl shadow-2xl shadow-zinc-200/20 dark:shadow-black/40 text-left transition-all hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:border-rose-500/40 hover:shadow-rose-500/10"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 flex items-center justify-center text-rose-500 mb-8 group-hover:scale-110 transition-transform duration-300 dark:from-rose-500/20 dark:to-orange-500/20">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 dark:text-white">{feature.title}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </main>
                
                <footer className="absolute bottom-6 w-full text-center text-sm text-zinc-500 dark:text-zinc-500 z-20">
                    <p>© {new Date().getFullYear()} FiskMail. Built with Laravel 12.</p>
                </footer>
            </div>
            
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onOpenChange={setIsAuthModalOpen} 
                initialView={authView} 
            />
        </>
    );
}
