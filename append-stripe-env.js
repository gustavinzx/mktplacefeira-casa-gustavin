const fs = require('fs');

const envContent = `
# Configurações de Pagamento (Stripe)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
`;

try {
  fs.appendFileSync('.env.local', envContent);
  fs.appendFileSync('.env.example', envContent);
  console.log("Successfully appended Stripe settings to env files");
} catch (e) {
  console.error("Error appending:", e);
}
