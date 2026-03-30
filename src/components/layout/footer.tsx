import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-sm">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold tracking-tight">Trust<span className="text-primary">X</span>change247</span>
            </div>
            <p className="text-sm text-muted-foreground">Professional investment platform for the modern investor.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: support@TrustXchange247.com</li>
              <li className="text-muted-foreground">Phone: +1 (702) 319-7242</li>
              <li className="text-muted-foreground">Office: 123 Finance St, NYC, NY 10001</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://t.me/trustxchangeglobalcom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0088cc] transition group">
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-[#0088cc] group-hover:bg-[#0088cc]/10 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.6.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.22 3.47-.49.34-.94.5-1.35.49-.45-.01-1.3-.25-1.94-.46-.78-.26-1.4-.4-1.35-.85.03-.23.33-.47.92-.71 3.59-1.56 5.99-2.6 7.2-3.1 3.43-1.43 4.14-1.68 4.6-1.69.1 0 .32.02.46.13.12.09.15.22.16.33-.01.07-.01.12-.02.21z"/></svg>
                </div>
                <span>Telegram</span>
              </a>
              <a href="https://wa.me/17023197242" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#25D366] transition group">
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-[#25D366] group-hover:bg-[#25D366]/10 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.062-.303-.15-1.267-.464-2.411-1.485-.888-.795-1.484-1.778-1.66-2.07-.174-.296-.019-.459.13-.607.136-.134.3-.347.45-.521.152-.172.2-.296.302-.494.098-.192.046-.363-.028-.51-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172 0-.372-.008-.57-.008-.201 0-.523.076-.798.375-.274.296-1.049 1.025-1.049 2.497s1.074 2.89 1.223 3.09c.149.196 2.105 3.21 5.1 4.505.713.308 1.268.492 1.701.629.715.227 1.365.195 1.886.118.577-.085 1.767-.722 2.016-1.426.248-.702.248-1.306.173-1.426-.073-.122-.272-.196-.574-.352zm-5.434 7.284h-.002c-1.49-.001-2.95-.4-4.23-1.155l-.304-.18-3.147.826.84-3.071-.197-.314a10.224 10.224 0 01-1.572-5.464c.003-5.65 4.603-10.245 10.256-10.245 2.738.002 5.312 1.07 7.247 3.007 1.936 1.938 3.003 4.512 3 7.252-.005 5.648-4.608 10.244-10.261 10.244zm8.411-16.711C18.225 2.71 15.244 1.5 12.062 1.5 6.273 1.5 1.558 6.21 1.55 12c-.004 1.85.484 3.655 1.41 5.248L1.5 24l6.905-1.812a11.956 11.956 0 005.657 1.416h.005c5.787 0 10.503-4.71 10.51-10.5.003-2.805-1.088-5.441-3.07-7.424z"/></svg>
                </div>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2025 TrustXchange247. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
