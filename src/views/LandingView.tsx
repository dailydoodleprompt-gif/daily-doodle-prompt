import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Flame,
  Trophy,
  Target,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onSignUp: () => void;
  onLogin: () => void;
  onPricing: () => void;
  onNavigate: (view: string) => void;
}

export function LandingView({ onGetStarted, onSignUp }: LandingViewProps) {
  const features = [
    {
      icon: Flame,
      title: 'Track Your Streak',
      description:
        'Build consistency with daily prompts and watch your streak grow!',
    },
    {
      icon: Trophy,
      title: 'Earn Badges',
      description:
        'Unlock achievements at 7-day and 30-day milestones!',
    },
    {
      icon: Target,
      title: 'All Skill Levels',
      description:
        'From beginner to advanced, there\'s a prompt for everyone!',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 md:py-20">
        <div className="container px-4 mx-auto text-center">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: '#fcedd7', color: '#000000' }}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            New prompts every day
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span style={{ color: '#fdf8ee' }}>Spark Your Creativity</span>
            <br />
            <span style={{ color: '#F17313' }}>One Doodle at a Time!</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Daily drawing prompts to challenge, inspire, and grow your artistic
            skills. Perfect for artists of all levels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="gap-2">
              See Today's Prompt
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSignUp}
              style={{ backgroundColor: '#FFFFFF', color: '#000000', borderColor: '#000000' }}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#fffcf6] dark:bg-[#2a2522]">
        <div className="container px-4 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-black dark:text-[#f5f2ed]">
            Why Artists Love Daily Doodle Prompt
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-[#fffcf6] dark:bg-[#2a2522] border-none shadow-none">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#fcedd7] dark:bg-[#453d38]">
                    <feature.icon className="w-6 h-6 text-[#F17313]" />
                  </div>
                  <h3 className="font-bold mb-2 text-black dark:text-[#f5f2ed]">{feature.title}</h3>
                  <p className="text-sm text-black dark:text-[#a39e98]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Creative Adventure?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of artists who use DailyDoodlePrompt to build their
            creative practice.
          </p>
          <Button size="lg" onClick={onGetStarted} className="gap-2">
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            {/* Brand */}
            
              href="/"
              className="flex items-center gap-2 font-semibold hover:opacity-80 transition"
            >
              <img
                src="/logo.svg"
                alt="Daily Doodle Prompt"
                className="h-8 w-auto"
              />
              <span>DailyDoodlePrompt</span>
            </a>

            {/* Utility links */}
            <div className="flex gap-6 text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/support" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>

            {/* Copyright */}
            <div className="text-muted-foreground">
              © {new Date().getFullYear()} Daily Doodle Prompt
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}