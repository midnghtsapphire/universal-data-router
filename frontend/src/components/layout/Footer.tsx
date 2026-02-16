import { Leaf, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Application footer"
      className="px-4 md:px-6 py-4 border-t border-charcoal-800/30"
      style={{ background: 'rgba(10, 9, 8, 0.6)' }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-400">
        <div className="flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-forest-500" aria-hidden="true" />
          <span>Carbon-efficient by design</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            AI categorization provided by{' '}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:text-gold-400 underline"
              aria-label="OpenRouter AI API (opens in new tab)"
            >
              OpenRouter API
            </a>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Payments by{' '}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:text-gold-400 underline"
              aria-label="Stripe payment processing (opens in new tab)"
            >
              Stripe
            </a>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://meetaudreyevans.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gold-500 hover:text-gold-400 transition-colors"
            aria-label="Visit GlowStarLabs hub at meetaudreyevans.com (opens in new tab)"
          >
            <span>GlowStarLabs</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <span aria-hidden="true">·</span>
          <span>&copy; {new Date().getFullYear()} Audrey Evans</span>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] text-charcoal-500">
        Built with free and open-source tools. Part of the GlowStarLabs / Audrey Evans ecosystem.
      </div>
    </footer>
  );
}
