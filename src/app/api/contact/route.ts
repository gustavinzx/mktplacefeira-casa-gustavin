import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message, subject } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Salvar no banco (mktplace_feira_support_tickets)
    const { error: dbError } = await supabaseAdmin
      .from('mktplace_feira_support_tickets')
      .insert({
        subject: subject || `Contato via site: ${name}`,
        description: `De: ${name} <${email}>\n\nMensagem:\n${message}`,
        priority: 'medium',
        status: 'open'
      });

    if (dbError) {
      console.error('Erro ao salvar ticket no banco:', dbError);
      return NextResponse.json({ error: 'Erro ao registrar contato no banco de dados' }, { status: 500 });
    }

    // 2. Enviar email (se o SMTP estiver configurado)
    if (process.env.SMTP_HOST && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Feira Casa <contato@feira.casa>',
          to: 'contato@feira.casa',
          replyTo: email,
          subject: subject || `Novo contato recebido: ${name}`,
          text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
          html: `<p><strong>Nome:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 <br/><p><strong>Mensagem:</strong></p>
                 <p>${message.replace(/\n/g, '<br/>')}</p>`,
        });
      } catch (emailError) {
        console.error('Erro ao enviar email via SMTP:', emailError);
        // Não retorna erro 500 porque o ticket já foi salvo no banco com sucesso
      }
    }

    return NextResponse.json({ success: true, message: 'Contato enviado com sucesso' });

  } catch (error: any) {
    console.error('Erro na rota de contato:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
