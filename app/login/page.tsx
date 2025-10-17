'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Microscope, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8" style={{
      background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.15) 0%, rgba(196, 181, 253, 0.15) 50%, rgba(134, 239, 172, 0.15) 100%)'
    }}>
      {/* Floating orbs for depth */}
      <div 
        className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float pointer-events-none"
        style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}
      />
      <div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float-delayed pointer-events-none"
        style={{ backgroundColor: 'rgba(196, 181, 253, 0.3)' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ backgroundColor: 'rgba(134, 239, 172, 0.2)' }}
      />

      {/* Main content */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 space-y-8 animate-fade-in">
          {/* Logo and header */}
          <div className="text-center space-y-4">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-2"
              style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #C4B5FD 100%)' }}
            >
              <Microscope className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: '#1F2937' }}>
                Đăng nhập
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#6B7280' }}>
                Hệ thống quản lý mẫu phòng lab
              </p>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium"
                style={{ color: '#1F2937' }}
              >
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#6B7280' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-12 h-12 bg-white/50 border-white/20 rounded-xl transition-all focus:ring-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium"
                style={{ color: '#1F2937' }}
              >
                Mật khẩu
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#6B7280' }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-12 h-12 bg-white/50 border-white/20 rounded-xl transition-all focus:ring-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div 
                className="text-sm rounded-xl p-4 animate-shake"
                style={{ 
                  color: '#FCA5A5',
                  backgroundColor: 'rgba(252, 165, 165, 0.1)',
                  borderWidth: '1px',
                  borderColor: 'rgba(252, 165, 165, 0.2)'
                }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: loading ? '#93C5FD' : 'linear-gradient(90deg, #93C5FD 0%, #C4B5FD 100%)'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                {!loading && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
          </form>

          {/* Footer text */}
          <div className="text-center text-xs pt-4 border-t border-white/20" style={{ color: '#6B7280' }}>
            Pathology Lab Management System v1.0
          </div>
        </div>

        {/* Decorative elements */}
        <div 
          className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl animate-pulse-slow pointer-events-none"
          style={{ backgroundColor: 'rgba(254, 215, 170, 0.3)' }}
        />
        <div 
          className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl animate-pulse-slow pointer-events-none"
          style={{ backgroundColor: 'rgba(134, 239, 172, 0.3)' }}
        />
      </div>
    </div>
  )
}
