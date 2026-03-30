"use client"

import { Shield, TrendingUp, Users, Lock } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "Your funds and data are protected with military-grade encryption and security protocols.",
    },
    {
      icon: TrendingUp,
      title: "Transparent Returns",
      description: "Clear, honest reporting of all returns and fees with no hidden charges or surprises.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Join thousands of successful investors building wealth together on our platform.",
    },
    {
      icon: Lock,
      title: "Compliance",
      description: "Fully compliant with international financial regulations and industry standards.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">About TrustXchange247</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Empowering investors worldwide with a secure, transparent, and professional investment platform that
                delivers consistent returns.
              </p>
            </div>
          </div>
        </section>

        {/* Company Story */}
        <section className="w-full py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  TrustXchange247 was founded with a simple mission: to make professional investment opportunities accessible
                  to everyone. We believe that financial growth shouldn't be reserved for the wealthy few.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform combines cutting-edge technology, transparent practices, and expert guidance to help
                  investors achieve their financial goals. We're committed to building trust through security,
                  accountability, and consistent performance.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 h-96 flex items-center justify-center">
                <p className="text-center text-muted-foreground font-semibold">Company Growth Chart Placeholder</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="w-full py-16 sm:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do at TrustXchange247
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="bg-card border border-border rounded-xl p-6">
                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Trust & Security */}
        <section className="w-full py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Trust & Security</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="text-4xl font-bold text-primary mb-2">256-bit</div>
                <p className="text-muted-foreground">Military-grade encryption for all transactions</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="text-4xl font-bold text-accent mb-2">100%</div>
                <p className="text-muted-foreground">User funds held in secure, insured accounts</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Continuous monitoring and fraud detection</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
