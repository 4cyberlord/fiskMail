import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { sendCode } from '@/routes/register';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const OTP_LENGTH = 6;

type AuthModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialView?: 'login' | 'register';
};

export function AuthModal({ isOpen, onOpenChange, initialView = 'login' }: AuthModalProps) {
    const [view, setView] = useState<'login' | 'register'>(initialView);
    const [otpCode, setOtpCode] = useState('');

    const title = view === 'login' ? 'Log in to your account' : 'Create an account';
    const description = view === 'login'
        ? 'Enter your email to receive a one-time login code'
        : 'Enter your name and email to receive a verification code';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                <div className="flex flex-col gap-8 rounded-[2rem] bg-white/80 p-10 shadow-2xl shadow-rose-500/10 backdrop-blur-3xl border border-white/50 dark:border-white/10 dark:bg-black/60 relative">
                    <DialogHeader className="flex flex-col items-center gap-4">
                        <div className="group flex flex-col items-center gap-2 font-medium">
                            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-600 shadow-xl shadow-rose-500/25">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="relative mt-2">
                        <AnimatePresence mode="wait">
                            {view === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <LoginForm setView={setView} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <RegisterForm setView={setView} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LoginForm({ setView }: { setView: (view: 'login' | 'register') => void }) {
    return (
        <Form
            {...store.form()}
            className="flex flex-col gap-8"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-8">
                        <div className="grid gap-3">
                            <Label htmlFor="login_email">Email address</Label>
                            <Input
                                id="login_email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <Button
                            type="submit"
                            className="mt-2 w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-90 border-0 text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-95 h-12 rounded-xl"
                            tabIndex={2}
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Send code
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-2">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setView('register')}
                            className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                        >
                            Sign up
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}

function RegisterForm({ setView }: { setView: (view: 'login' | 'register') => void }) {
    return (
        <Form
            {...sendCode.form()}
            disableWhileProcessing
            className="flex flex-col gap-8"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-8">
                        <div className="grid gap-3">
                            <Label htmlFor="register_name">Name</Label>
                            <Input
                                id="register_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Full name"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="register_email">Email address</Label>
                            <Input
                                id="register_email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-90 border-0 text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-95 h-12 rounded-xl"
                            tabIndex={3}
                        >
                            {processing && <Spinner />}
                            Send verification code
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-2">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                        >
                            Log in
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}
