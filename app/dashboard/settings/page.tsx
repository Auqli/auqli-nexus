"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Key, CreditCard, Bell, Save } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({
    fullName: "",
    email: "",
    company: "",
    jobTitle: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    setIsLoaded(true)

    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // Set email from auth user
        setProfile((prev) => ({ ...prev, email: user.email }))

        // Set name from user metadata
        if (user.user_metadata?.full_name) {
          setProfile((prev) => ({ ...prev, fullName: user.user_metadata.full_name }))
        }

        // Fetch additional profile data from user_profiles table
        const { data: profileData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileData && !error) {
          // Update profile with data from database
          setProfile((prev) => ({
            ...prev,
            company: profileData.company_name || "",
            jobTitle: profileData.job_title || "",
          }))
        }
      }
    }

    fetchUserProfile()
  }, [supabase])

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: profile.fullName },
      })

      if (updateError) throw updateError

      // Update profile in database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: profile.fullName,
          company_name: profile.company,
          job_title: profile.jobTitle,
        })
        .eq("user_id", user.id)

      if (profileError) throw profileError

      setSuccessMessage("Profile updated successfully")
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-[#1A1D24] border border-gray-800">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
            >
              <Key className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {successMessage && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-800/50 border-gray-700 opacity-70"
                  />
                  <p className="text-xs text-gray-400">To change your email, go to the Account tab</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    className="bg-gray-800/50 border-gray-700"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas">
              <CardHeader>
                <CardTitle className="text-white">Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Change Password</h3>
                      <p className="text-sm text-gray-400">Update your password to keep your account secure</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Active Sessions</h3>
                      <p className="text-sm text-gray-400">Manage devices where you're currently logged in</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Manage Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas">
              <CardHeader>
                <CardTitle className="text-white">Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Free Plan</h3>
                      <p className="text-sm text-emerald-400">Your current plan</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Upgrade Plan</Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium text-white">Payment Methods</h3>
                  <p className="text-sm text-gray-400">No payment methods added yet</p>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Add Payment Method
                  </Button>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium text-white">Billing History</h3>
                  <p className="text-sm text-gray-400">No billing history available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-gray-800 bg-[#1A1D24] shadow-saas">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive notifications about account activity via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Product Updates</h3>
                      <p className="text-sm text-gray-400">Receive updates about new features and improvements</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Marketing Emails</h3>
                      <p className="text-sm text-gray-400">Receive promotional offers and marketing communications</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
