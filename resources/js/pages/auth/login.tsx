import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
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
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';

const OTP_LENGTH = 6;

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    otpEmail?: string | null;
};

export default function Login({
    status,
    canRegister,
    otpEmail,
}: Props) {
    const [otpCode, setOtpCode] = useState('');
    const showOtpStep = Boolean(otpEmail);

    return (
        <AuthLayout
            title={showOtpStep ? 'Enter your code' : 'Log in to your account'}
            description={
                showOtpStep
                    ? 'Enter the 6-digit code we sent to your email'
                    : 'Enter your email to receive a one-time login code'
            }
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                className="flex flex-col gap-6"
                resetOnSuccess={!showOtpStep ? ['otp_code'] : undefined}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {!showOtpStep ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
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
                                        className="mt-4 w-full"
                                        tabIndex={2}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        Send code
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="hidden"
                                        name="email"
                                        value={otpEmail ?? ''}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="otp_code">Verification code</Label>
                                        <div className="flex justify-center">
                                            <InputOTP
                                                name="otp_code"
                                                maxLength={OTP_LENGTH}
                                                value={otpCode}
                                                onChange={setOtpCode}
                                                disabled={processing}
                                                pattern={REGEXP_ONLY_DIGITS}
                                            >
                                                <InputOTPGroup>
                                                    {Array.from(
                                                        { length: OTP_LENGTH },
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                index={index}
                                                            />
                                                        ),
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <InputError message={errors.otp_code} />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                        />
                                        <Label htmlFor="remember">Remember me</Label>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="mt-4 w-full"
                                        tabIndex={4}
                                        disabled={processing || otpCode.length !== OTP_LENGTH}
                                        data-test="verify-otp-button"
                                    >
                                        {processing && <Spinner />}
                                        Verify and log in
                                    </Button>
                                </>
                            )}
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
