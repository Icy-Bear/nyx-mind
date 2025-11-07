import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBrain, IconShield, IconMessage, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Nyx Minds</h1>
        <div className="flex space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-5xl font-bold mb-4">Unlock the Power of Your Mind</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover insights, enhance productivity, and achieve your goals with Nyx Minds – your AI-powered companion for mental clarity and growth.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/signup">Get Started Free</Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Nyx Minds?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <IconBrain className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Intelligent Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Leverage advanced AI to gain deep insights into your thoughts and behaviors.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <IconMessage className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Personalized Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Engage in meaningful dialogues tailored to your unique needs and preferences.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <IconShield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your data is protected with enterprise-grade security and privacy measures.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <IconSparkles className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Easy to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intuitive interface designed for seamless user experience across all devices.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t text-center text-muted-foreground">
        <p>&copy; 2025 Nyx Minds. All rights reserved.</p>
      </footer>
    </div>
  );
}
