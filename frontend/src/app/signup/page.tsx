import SignUpForm from "@/components/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
          <div className="max-w-md mx-auto md:mx-0 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Join Movie Tracker</h1>
              <p className="text-xl text-gray-600 mt-4">
                Create an account to track, discover, and organize your favorite movies and shows.
              </p>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-gray-500">Movies</p>
              </div>
              <div>
                <p className="text-2xl font-bold">5K+</p>
                <p className="text-gray-500">TV Shows</p>
              </div>
              <div>
                <p className="text-2xl font-bold">1 user</p>
                <p className="text-gray-500">Users
                  <br />
                  <span className="text-gray-500 text-xs">
                    (its just me)
                    <br />
                    (for now)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <SignUpForm />
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500">Built by Amaan</footer>
    </div>
  )
} 