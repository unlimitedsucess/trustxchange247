"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    id: "1",
    question: "How do I create an account on TrustXchange247?",
    answer:
      "Creating an account is simple. Click the 'Register' button on our homepage, fill in your personal information, and verify your email. You can start investing immediately after account verification.",
  },
  {
    id: "2",
    question: "What are the minimum and maximum investment amounts?",
    answer:
      "Investment limits vary by plan. The Basic Plan starts at $100 minimum and caps at $5,000. Standard Plan ranges from $5,000 to $50,000, and our Long-Term Investment Plan goes from $50,000 to $500,000.",
  },
  {
    id: "3",
    question: "How are returns calculated and paid?",
    answer:
      "Returns are calculated daily based on your investment amount and the plan's ROI percentage. Earnings are automatically added to your account and can be withdrawn or reinvested anytime.",
  },
  {
    id: "4",
    question: "Is my money safe on TrustXchange247?",
    answer:
      "Yes. We use 256-bit military-grade encryption, secure servers, and keep all funds in insured accounts. Our platform complies with international financial regulations and undergoes regular security audits.",
  },
  {
    id: "5",
    question: "How long does a withdrawal take?",
    answer:
      "Withdrawal requests are processed within 24-48 hours. Funds are transferred to your linked bank account within 1-3 business days depending on your bank's processing time.",
  },
  {
    id: "6",
    question: "Can I withdraw my money before the investment period ends?",
    answer:
      "Yes, you can withdraw your money at any time. However, early withdrawals before the investment period ends may be subject to a small penalty fee, which is disclosed at the time of investment.",
  },
  {
    id: "7",
    question: "What languages does TrustXchange247 support?",
    answer:
      "TrustXchange247 supports over 50 languages through Google Translate integration. You can change the language from the header menu to use the platform in your preferred language.",
  },
  {
    id: "8",
    question: "How can I contact customer support?",
    answer:
      "You can reach our support team via email at support@TrustXchange247.com, phone at +17023197242, or through the contact form on our Contact Us page. We're available 24/7 to assist you.",
  },
  {
    id: "9",
    question: "Is there a referral program?",
    answer:
      "Yes! Our referral program rewards you for inviting friends and family. You earn a commission on deposits made by your referrals. Check the dashboard for your unique referral link.",
  },
  {
    id: "10",
    question: "How do I reset my password?",
    answer:
      "On the login page, click 'Forgot password?' and enter your email address. You'll receive a password reset link within minutes. Click the link and create a new password.",
  },
]

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our platform, investments, and account management.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="w-full py-16 sm:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                >
                  <AccordionItem value={faq.id} className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <span className="text-left font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 sm:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
