import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/register/complete';

/** Format phone input as XXX-XXX-XXXX (max 10 digits). */
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type Props = {
    name: string;
    email: string;
};

export default function RegisterComplete({ name }: Props) {
    const [phoneValue, setPhoneValue] = useState('');

    return (
        <AuthLayout
            title={`Welcome, ${name}`}
            description="Enter your Fisk Student ID and phone number to finish registration"
        >
            <Head title="Complete registration" />
            <Form
                {...store.form()}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="student_id">
                                    Fisk Student ID
                                </Label>
                                <Input
                                    id="student_id"
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="off"
                                    name="student_id"
                                    placeholder="7 digits (e.g. 1234567)"
                                    minLength={7}
                                    maxLength={7}
                                    pattern="[0-9]{7}"
                                    title="Enter your 7-digit Fisk Student ID"
                                />
                                <p className="text-muted-foreground text-xs">
                                    Enter your 7-digit Fisk Student ID — no more,
                                    no less.
                                </p>
                                <InputError message={errors.student_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    Personal contact (phone)
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    tabIndex={2}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="847-853-7485"
                                    value={phoneValue}
                                    onChange={(e) =>
                                        setPhoneValue(
                                            formatPhone(e.target.value)
                                        )
                                    }
                                    maxLength={12}
                                    title="Format: XXX-XXX-XXXX"
                                />
                                <p className="text-muted-foreground text-xs">
                                    Format: 847-853-7485
                                </p>
                                <InputError message={errors.phone} />
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={3}
                                data-test="register-complete-button"
                            >
                                {processing && <Spinner />}
                                Complete registration
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
