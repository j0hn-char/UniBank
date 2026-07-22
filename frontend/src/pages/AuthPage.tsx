import { useState, type SubmitEvent } from 'react'
import {useAuth} from "@/context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import api from "@/api/axios.ts";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";
import {Eye, EyeOff, Wallet} from "lucide-react";

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
            const body =
                mode === 'login'
                    ? { email, password }
                    : { username, email, password, fullName }

            const response = await api.post(endpoint, body)
            login(response.data.token)
            navigate('/dashboard')
        } catch (err:any) {
            setError(err.response?.data?.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="overflow-hidden p-0 w-full max-w-3xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                                    <p className="text-balance text-muted-foreground">
                                        {mode === 'login' ? 'Sign in to UniBank' : 'Sign up for UniBank'}
                                    </p>
                                </div>

                                {mode === 'register' && (
                                    <>
                                        <Field>
                                            <FieldLabel htmlFor="username">Username</FieldLabel>
                                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                        </Field>
                                    </>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pr-9"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                </Field>

                                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                                <Field>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                                    </Button>
                                </Field>

                                <FieldDescription className="text-center">
                                    {mode === 'login' ? 'No account? ' : 'Already have an account? '}
                                    <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="underline">
                                        {mode === 'login' ? 'Create one' : 'Sign in'}
                                    </button>
                                </FieldDescription>
                            </FieldGroup>
                    </form>
                    <div className="relative hidden md:flex h-full items-center justify-center overflow-hidden bg-[#4338CA] p-8">
                        <div className="absolute w-[280px] h-[280px] rounded-full bg-[#3B31B5] -top-[140px] -right-[120px]" />
                        <div className="absolute w-[200px] h-[200px] rounded-full bg-[#372DA8] -bottom-[110px] -left-[70px]" />

                        <div className="absolute top-7 left-7 flex items-center gap-2 z-10">
                            <div className="w-5 h-5 rounded-md bg-white" />
                            <div className="text-white text-sm font-semibold">UniBank</div>
                        </div>

                        <div className="relative bg-[#4F46E5] rounded-[20px] p-5 w-[240px] h-[140px] box-border flex flex-col justify-between z-10 border border-white/10 shadow-lg shadow-black/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-white text-sm font-semibold">Everyday</div>
                                    <div className="text-[#C7D2FE] text-xs mt-0.5">Checking</div>
                                </div>
                                <Wallet size={18} className="text-[#C7D2FE]" />
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-[#C7D2FE] text-xs">•••• 4821</div>
                                <div className="text-white text-base font-semibold tabular-nums">4.238,12 €</div>
                            </div>
                        </div>

                        <div className="absolute bottom-7 left-7 right-7 text-[#E0E7FF] text-sm leading-relaxed z-10">
                            Banking built for university life.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}