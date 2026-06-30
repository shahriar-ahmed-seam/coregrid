import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} CoreGrid. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link 
              href="/about" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/support" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>

          {/* Version or additional info */}
          <div className="text-sm text-muted-foreground">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
