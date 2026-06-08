const fs = require('fs');

const envContent = `
# Configurações de E-mail (SMTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=
SMTP_FROM="Feira Casa <contato@feira.casa>"
`;

try {
  fs.appendFileSync('.env.local', envContent);
  fs.appendFileSync('.env.example', envContent);
  console.log("Successfully appended to env files");
} catch (e) {
  console.error("Error appending:", e);
}
