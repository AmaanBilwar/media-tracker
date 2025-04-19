"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignIn, useUser } from "@clerk/nextjs"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const [verificationError, setVerificationError] = useState(false)
  const router = useRouter()
  const { signIn, setActive } = useSignIn()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (isLoaded && user) {
      router.push("/dashboard")
    }
  }, [isLoaded, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setShowSignUpPrompt(false)
    setVerificationError(false)
    
    if (!signIn) {
      setError("Authentication service not available")
      setIsLoading(false)
      return
    }
    
    try {
      // Start the sign-in process with the correct parameters for Clerk v6
      const result = await signIn.create({
        identifier: email,
        password,
      })
      
      if (result?.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId })
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // Handle multi-factor authentication or other verification methods
        console.log("Additional verification required:", result)
        
        // Check if we need to handle a specific verification strategy
        if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
          // Redirect to a verification page or show verification UI
          router.push("/verify")
        } else {
          setError("Additional verification required. Please check your email.")
        }
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.errors?.[0]?.message?.includes("Couldn't find your account")) {
        setError("We couldn't find an account with this email address.")
        setShowSignUpPrompt(true)
      } else if (err.errors?.[0]?.message?.includes("verification strategy is not valid")) {
        setError("This account requires a different verification method.")
        setVerificationError(true)
      } else if (err.errors?.[0]?.message?.includes("single session mode")) {
        setError("You are already signed in with a different account. Please sign out first.")
      } else {
        setError(err.errors?.[0]?.message || "Invalid email or password")
      }
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // If user is already signed in, show a message
  if (isLoaded && user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center mb-6">
          <h2 className="text-2xl font-bold">Already Signed In</h2>
          <p className="text-gray-500">You are already signed in. Redirecting to dashboard...</p>
        </div>
        <Button 
          className="w-full" 
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2 text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-gray-500">Sign in to your account to continue</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {showSignUpPrompt && (
        <div className="mb-4 p-3 bg-blue-100 text-zinc-300 rounded-md text-sm">
          Don't have an account yet?{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </button>
        </div>
      )}
      
      {verificationError && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">
          <p className="font-medium">Verification Method Issue</p>
          <p className="text-xs mt-1">This account was created with a different verification method. Please try signing up again with a different email or contact support.</p>
          <div className="mt-2">
            <button
              type="button"
              className="text-xs font-medium underline"
              onClick={() => router.push("/signup")}
            >
              Create a new account
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        
        <div id="clerk-captcha" className="w-full"></div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-zinc-800 hover:text-zinc-600 hover:cursor-pointer font-medium"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
