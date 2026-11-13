# Project memory

## Product intent & audience

- MusoHive: e-commerce store (likely music/instruments focus) sending branded transactional order confirmation emails after successful payments.
- Customers receive confirmation emails with personalized name, order details, and delivery info.

## Brand personality & voice

- Branded, engaging tone; emails address customer by first and last name.
- Visual identity uses MusoHive logo variants: icon at top, light logo in footer.

## Visual design & UX direction

- Email template structure: MusoHive icon logo at top, branded header, customer greeting (first + last name), order items (images, names, quantities, totals), payment summary (subtotal, shipping, total paid, Paystack reference/status), delivery section, customer contact number, footer with light logo.
- Delivery section adapts: home delivery shows address details; Pep-Store shows collection point.
- White-background dividers between each section for clear visual separation.
- Logo assets: `public/images/logo/logo-icon.png` (top), `public/images/logo/logo-light.png` (footer).

## Decisions, constraints & rationale

- Angular frontend; backend uses Supabase Edge Functions (`verify-payment`, `paystack-webhook`).
- Payment processor: Paystack; both verification path and webhook path send the same branded email.
- No new image files created — existing public logo paths referenced directly.
- Sandbox build can hit esbuild memory limit; retry with higher memory setting when `npm run build` is killed.
- Edge functions were deployed after changes; `npm run build` must pass.

## Open questions & assumptions

- Email HTML is constructed inline within Edge Functions (assumed; no dedicated email template service mentioned).
- Delivery method field shape and Pep-Store data structure inferred from order payload — exact field names not yet documented.
- No `.bolt/prompt` authoritative instructions exist yet.