import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabase';

const SETTINGS_KEY = 'smtp_config';

interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  encryption: 'TLS' | 'SSL' | 'none';
  from_email: string;
  from_name: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function loadSmtpConfig(): Promise<SmtpConfig | null> {
  const { data } = await supabaseAdmin
    .from('mktplace_feira_admin_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle();

  const cfg = (data?.value as { smtp?: SmtpConfig })?.smtp;
  if (!cfg?.host || !cfg?.user || !cfg?.password || !cfg?.from_email) return null;
  return cfg;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const cfg = await loadSmtpConfig();
  if (!cfg) return { ok: false, error: 'SMTP não configurado. Configure em Admin → Configurações → SMTP.' };

  const port = parseInt(cfg.port) || 587;
  const secure = cfg.encryption === 'SSL';

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port,
    secure,
    auth: { user: cfg.user, pass: cfg.password },
    ...(cfg.encryption === 'none' && { tls: { rejectUnauthorized: false } }),
  });

  try {
    await transporter.sendMail({
      from: `"${cfg.from_name}" <${cfg.from_email}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

// ─── HTML Templates ───────────────────────────────────────────────────────────

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f6f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0e6b17; padding: 36px 40px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.75); font-size: 13px; }
    .body { padding: 40px; }
    .cta { display: inline-block; background: #0e6b17; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 800; font-size: 15px; margin: 24px 0; }
    .footer { background: #f4f6f0; padding: 24px 40px; text-align: center; color: #8a9489; font-size: 12px; }
    h2 { color: #1b1c19; font-size: 24px; font-weight: 900; margin: 0 0 12px; }
    p { color: #404940; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .code { background: #f0f7f0; border: 2px dashed #0e6b17; border-radius: 12px; padding: 20px; text-align: center; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0e6b17; margin: 24px 0; }
    .divider { height: 1px; background: #efeee9; margin: 28px 0; }
    .warning { background: #fff8f0; border-left: 4px solid #ff8c00; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #7a4800; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🌿 Feira.Casa</h1>
      <p>Produtos frescos do produtor para você</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Feira.Casa — Todos os direitos reservados</p>
      <p>Você recebeu este e-mail pois tem uma conta na plataforma.</p>
    </div>
  </div>
</body>
</html>`;

export const emailTemplates = {
  confirmacao_cadastro: (name: string, link: string) => baseLayout(`
    <h2>Confirme seu e-mail</h2>
    <p>Olá, <strong>${name || 'bem-vindo(a)'}</strong>! 🎉</p>
    <p>Clique no botão abaixo para confirmar seu e-mail e ativar sua conta na Feira.Casa.</p>
    <a href="${link}" class="cta">Confirmar meu e-mail</a>
    <div class="divider"></div>
    <div class="warning">⏱ Este link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.</div>
  `),

  recuperacao_senha: (link: string) => baseLayout(`
    <h2>Redefinir sua senha</h2>
    <p>Recebemos um pedido para redefinir a senha da sua conta na Feira.Casa.</p>
    <a href="${link}" class="cta">Redefinir minha senha</a>
    <div class="divider"></div>
    <p>Se você não solicitou a redefinição de senha, ignore este e-mail — sua conta está segura.</p>
    <div class="warning">⏱ Este link é válido por apenas 1 hora.</div>
  `),

  otp: (code: string, action: string) => baseLayout(`
    <h2>Seu código de verificação</h2>
    <p>Use o código abaixo para ${action || 'confirmar sua identidade'}:</p>
    <div class="code">${code}</div>
    <div class="warning">⏱ Este código expira em 10 minutos. Não compartilhe com ninguém.</div>
  `),

  confirmacao_pedido: (orderId: string, total: string, items: string) => baseLayout(`
    <h2>Pedido confirmado! 🛒</h2>
    <p>Seu pedido <strong>#${orderId}</strong> foi recebido e está sendo preparado.</p>
    ${items}
    <div class="divider"></div>
    <p><strong>Total: ${total}</strong></p>
    <p>Você pode acompanhar o status do seu pedido na plataforma.</p>
  `),

  boas_vindas: (name: string) => baseLayout(`
    <h2>Bem-vindo(a) à Feira.Casa! 🌿</h2>
    <p>Olá, <strong>${name}</strong>! Estamos felizes em ter você com a gente.</p>
    <p>Na Feira.Casa você encontra produtos frescos direto de produtores locais, com entrega rápida e qualidade garantida.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://feira.casa'}" class="cta">Explorar a feira</a>
  `),

  aprovacao_feirante: (name: string) => baseLayout(`
    <h2>Sua conta foi aprovada! 🎉</h2>
    <p>Olá, <strong>${name}</strong>! Boas notícias: sua conta como feirante foi aprovada na Feira.Casa.</p>
    <p>Você já pode acessar seu portal, cadastrar seus produtos e começar a vender.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://feira.casa'}/portal/feirante" class="cta">Acessar meu portal</a>
  `),
};
