import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact Us — EarnSpin Rewards" }]
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium text-sm">Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have questions about your rewards, need technical support, or want to partner with us? We're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass p-8 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe" 
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com" 
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Subject</label>
                <select className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition appearance-none">
                  <option value="support">General Support</option>
                  <option value="payment">Payment & Withdrawal Issue</option>
                  <option value="bug">Report a Bug</option>
                  <option value="partnership">Partnership Inquiry</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="How can we help you?" 
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email Support</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Our team typically responds within 24 hours.
                </p>
                <a href="mailto:support@earnspin.app" className="text-primary font-medium text-sm mt-2 inline-block hover:underline">
                  support@earnspin.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Live Chat</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Available in the app for premium users during business hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Business Inquiries</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  EarnSpin Rewards Inc.<br />
                  Global Operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
