import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [{ title: "Terms of Service — EarnSpin Rewards" }]
  }),
  component: TermsOfService,
});

function TermsOfService() {
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

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground/90">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and EarnSpin Rewards ("we," "us" or "our"), concerning your access to and use of our website and mobile application. You agree that by accessing the site, you have read, understood, and agreed to be bound by all of these Terms of Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Rewards and Redemptions</h2>
            <p>
              EarnSpin Rewards provides a platform where users can earn virtual currency ("Coins") by completing various tasks, including but not limited to playing games, spinning a virtual wheel, and referring friends.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Coins have no real-world monetary value until they are officially redeemed through our platform.</li>
              <li>We reserve the right to change the conversion rate of Coins to real-world currency at any time without prior notice.</li>
              <li>A minimum balance (as stated in the app) must be reached before any withdrawal request can be processed.</li>
              <li>We reserve the right to void any Coins earned through exploiting bugs, using automated scripts, or engaging in fraudulent activity. Accounts found engaging in such activities will be banned permanently.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. You agree not to engage in any unauthorized framing of or linking to the Site, trick, defraud, or mislead us and other users, or attempt to bypass any measures of the Site designed to prevent or restrict access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us via our Contact page or through customer support inside the app.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
