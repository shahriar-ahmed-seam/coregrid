import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Target, Award, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">About CoreGrid</h1>
        <p className="text-muted-foreground">Learn more about our mission and values</p>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Empowering Businesses Through Technology</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          CoreGrid is an autonomous enterprise resource planning system designed to streamline 
          your business operations, enhance productivity, and drive growth.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To provide businesses of all sizes with powerful, intuitive, and affordable 
              enterprise management tools that automate routine tasks, provide actionable 
              insights, and enable teams to focus on what matters most—growing their business.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To become the leading autonomous enterprise platform that transforms how 
              businesses operate, making sophisticated AI-powered management tools accessible 
              to every organization worldwide.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Our Core Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                We constantly push boundaries to deliver cutting-edge solutions that 
                anticipate and meet evolving business needs.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Customer Focus</h3>
              <p className="text-sm text-muted-foreground">
                Every feature we build is designed with our users in mind, ensuring 
                intuitive experiences and real business value.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold mb-2">Integrity</h3>
              <p className="text-sm text-muted-foreground">
                We operate with transparency, honesty, and accountability in everything 
                we do, building trust with our customers and partners.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Founded</h4>
              <p className="text-muted-foreground">2024</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Headquarters</h4>
              <p className="text-muted-foreground">San Francisco, California</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Industry</h4>
              <p className="text-muted-foreground">Enterprise Software / SaaS</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Platform</h4>
              <p className="text-muted-foreground">Cloud-based, AI-Powered ERP</p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
              CoreGrid is built with modern technologies including Next.js, React, TypeScript, 
              and Prisma, ensuring a fast, reliable, and scalable platform for businesses of all sizes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
