import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
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
import { store } from '@/routes/register/verify';

const OTP_LENGTH = 6;

type Props = {
    email: string;
    status?: string;
};

export default function RegisterVerify({ email, status }: Props) {
    const [code, setCode] = useState('');

    return (
        <AuthLayout
            title="Verify your email"
            description="Enter the 6-digit code we sent to your email"
        >
            <Head title="Verify registration" />
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
            <Form
                {...store.form()}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <input type="hidden" name="email" value={email} />
                            <div className="grid gap-2">
                                <Label htmlFor="email-display">Email address</Label>
                                <Input
                                    id="email-display"
                                    type="text"
                                    value={email}
                                    readOnly
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Verification code</Label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_LENGTH}
                                        value={code}
                                        onChange={setCode}
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
                                <InputError message={errors.code} />
                            </div>
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={1}
                                disabled={processing || code.length !== OTP_LENGTH}
                                data-test="register-verify-button"
                            >
                                {processing && <Spinner />}
                                Verify and continue
                            </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Wrong email?{' '}
                            <TextLink href={register()} tabIndex={2}>
                                Start over
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
