import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserButton } from "@clerk/nextjs"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Username</h2>
              <p className="text-gray-500">Member since April 2023</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="User Name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="********" />
            </div>

            <Button className="w-full">Save Changes</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
