import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { SiteFooter } from "@/components/layout/site-footer"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export default function PricingPage() {
  // Add this at the beginning of the PricingPage function
  console.log("Rendering pricing page")
  return (
    <>
      <PageContainer>
        <PageHeader
          title="Simple, Transparent Pricing"
          description="Choose the plan that works best for your business needs"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {/* Basic Plan */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Basic</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$19</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <CardDescription className="mt-2">Perfect for small businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic product formatting</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Up to 100 products</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Email support</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">Coming Soon</Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mx-auto mb-4">
                MOST POPULAR
              </div>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <CardDescription className="mt-2">Ideal for growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced product formatting</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Up to 1,000 products</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>AI-powered descriptions</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Coming Soon</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$99</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <CardDescription className="mt-2">For large-scale operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Premium product formatting</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited products</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>24/7 dedicated support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced AI features</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Custom integrations</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">Coming Soon</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-16 mb-8">
          <p className="text-gray-500">
            Need a custom plan?{" "}
            <a href="#" className="text-green-500 hover:underline">
              Contact us
            </a>{" "}
            for more information.
          </p>
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  )
}
