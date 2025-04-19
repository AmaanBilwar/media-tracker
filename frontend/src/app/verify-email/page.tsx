"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from "@clerk/nextjs"

export default function VerifyEmailPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signUp, setActive } = useSignUp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    if (!signUp) {
      setError("Authentication service not available")
      setIsLoading(false)
      return
    }
    
    try {
      // Attempt to verify the email code
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })
      
      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId })
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code")
      console.error("Verification error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-gray-500">
            We've sent a verification code to your email address.
            Please enter it below to complete your registration.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div id="clerk-captcha" className="w-full"></div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive a code?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={async () => {
                if (signUp) {
                  try {
                    await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
                    alert("A new verification code has been sent to your email.")
                  } catch (err) {
                    console.error("Error resending code:", err)
                    setError("Failed to resend verification code")
                  }
                }
              }}
            >
              Resend code
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 