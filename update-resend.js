const fs = require('fs');

const envPath = 'c:/Users/gsds0/Desktop/mktplacefeira.casa/.env.local';
let content = fs.readFileSync(envPath, 'utf8');

const regex = /SMTP_PASS=.*/;
if (regex.test(content)) {
  content = content.replace(regex, 'SMTP_PASS=re_4qc5kEon_34gxfpF65rBe1ppgFkcTiDpu');
} else {
  content += '\nSMTP_PASS=re_4qc5kEon_34gxfpF65rBe1ppgFkcTiDpu';
}

fs.writeFileSync(envPath, content, 'utf8');
console.log("Resend API key added to .env.local");
