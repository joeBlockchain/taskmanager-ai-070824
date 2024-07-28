import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-6 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2024 TaskManager-AI. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-4">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
