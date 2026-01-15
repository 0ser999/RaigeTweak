# Raige Tweak Website

A modern, clean website for selling Raige Tweak optimization tools with integrated Stripe and PayPal payment systems.

## Features

- **Modern Design**: Clean, professional theme with smooth animations
- **Two Products**: 
  - Raige Tweak ($25)
  - Raige Tweak Ultra ($32)
- **Payment Integration**: 
  - Stripe payment processing
  - PayPal payment processing
- **Responsive Design**: Works on all devices
- **About Section**: Information about Raige Tweak

## Setup Instructions

### 1. Stripe Integration

1. Sign up for a Stripe account at https://stripe.com
2. Get your Publishable Key from the Stripe Dashboard
3. Replace `YOUR_STRIPE_PUBLISHABLE_KEY` in `script.js` with your actual key
4. Set up a server endpoint at `/create-payment-intent` to create payment intents

### 2. PayPal Integration

1. Sign up for a PayPal Developer account at https://developer.paypal.com
2. Create a new app and get your Client ID
3. Replace `YOUR_PAYPAL_CLIENT_ID` in `index.html` with your actual Client ID
4. Set up a server endpoint at `/verify-payment` to verify PayPal payments

### 3. Server Setup (Required for Production)

For production use, you'll need a backend server to:
- Create Stripe payment intents securely
- Verify PayPal payments
- Handle webhooks from both payment providers
- Process orders and send confirmation emails

Example server structure:
```
server/
  ├── create-payment-intent.js (Stripe)
  ├── verify-payment.js (PayPal)
  └── webhooks.js (Payment confirmations)
```

## File Structure

```
├── index.html      # Main HTML file
├── styles.css      # Styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Customization

- Update product descriptions in `index.html`
- Modify colors in `styles.css` (CSS variables in `:root`)
- Adjust payment flow in `script.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2024 Raige Tweak. All rights reserved.

