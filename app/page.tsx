"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Users, FileSpreadsheet, BarChart3 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initLoading, setInitLoading] = useState(false)
  const [initMessage, setInitMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initializeAdmin = async () => {
    setInitLoading(true)
    setInitMessage('')

    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setInitMessage(`Admin user created! Email: ${data.credentials.email}, Password: ${data.credentials.password}`)
        setEmail(data.credentials.email)
        setPassword(data.credentials.password)
      } else {
        setInitMessage(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      setInitMessage('Network error. Please try again.')
    } finally {
      setInitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900">
              Task Management System
            </h1>
            <p className="text-xl text-blue-700">
              Efficiently distribute and manage tasks across your team with our comprehensive MERN stack solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">Agent Management</h3>
              <p className="text-sm text-blue-600">Create and manage agents and sub-agents</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">File Upload</h3>
              <p className="text-sm text-blue-600">Upload CSV/Excel files for task distribution</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">Analytics</h3>
              <p className="text-sm text-blue-600">Track task distribution and performance</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full max-w-md mx-auto border-blue-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-blue-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {initMessage && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-700">{initMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-900">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-blue-600">First time setup</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={initializeAdmin}
              disabled={initLoading}
            >
              {initLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Initialize Admin User'
              )}
            </Button>

            <div className="text-center text-sm text-blue-600">
              <p>Demo credentials will be provided after initialization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
