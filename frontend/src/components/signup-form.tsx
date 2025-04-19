"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp, useUser } from "@clerk/nextjs"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationError, setVerificationError] = useState(false)
  const router = useRouter()
  const { signUp, setActive } = useSignUp()
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
    setVerificationError(false)
    
    if (!signUp) {
      setError("Authentication service not available")
      setIsLoading(false)
      return
    }
    
    try {
      // Start the sign-up process with the correct parameter structure
      const result = await signUp.create({
        emailAddress: email,
        password,
      })
      
      // Update the user's profile with first and last name
      if (result.createdUserId) {
        await signUp.update({
          firstName,
          lastName,
        })
      }
      
      // Prepare for email verification
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        // Redirect to verification page
        router.push("/verify-email")
      } catch (verificationError: any) {
        // Handle verification strategy error
        if (verificationError.errors?.[0]?.message?.includes("verification strategy is not valid")) {
          setError("This email domain may not be supported for verification. Please try a different email address.")
          setVerificationError(true)
        } else {
          setError(verificationError.errors?.[0]?.message || "Error preparing email verification")
        }
        console.error("Verification error:", verificationError)
      }
    } catch (err: any) {
      // Handle the single session mode error specifically
      if (err.errors?.[0]?.message?.includes("single session mode")) {
        setError("You are already signed in. Please sign out before creating a new account.")
      } else {
        setError(err.errors?.[0]?.message || "An error occurred during sign up")
      }
      console.error("Sign up error:", err)
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
          <p className="text-gray-500">You are already signed in. Please sign out before creating a new account.</p>
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
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-gray-500">Sign up to get started with Movie Tracker</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {verificationError && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">
          <p className="font-medium">Try a different email address</p>
          <p className="text-xs mt-1">Some email domains may not be supported for verification. Try using a Gmail, Outlook, or other popular email provider.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full"
            />
          </div>
        </div>
        
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        
        {/* Add the CAPTCHA element */}
        <div id="clerk-captcha" className="w-full"></div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => router.push("/")}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
} 