import { type Request, type Response } from "express";

let resendClient: any = null;
function getResend(): any {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    try {
      const { Resend } = require("resend");
      resendClient = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
      console.error("[resend] failed to load module", err);
      return null;
    }
  }
  return resendClient;
}

export async function createResendEmail(req: Request, res: Response) {
  const resend = getResend();
  if (!resend) {
    return res.status(503).json({ error: "Service email non configure (RESEND_API_KEY manquante)" });
  }
  try {
    const { name, email, subject, message } = req.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Adresse email invalide" });
    }

    if (!name || !subject || !message) {
      return res.status(400).json({ error: "Champs requis manquants (name, subject, message)" });
    }

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <onboarding@resend.co>`,
      to: process.env.CONTACT_RECIPIENT_EMAIL || "talibi.abder@gmail.com",
      subject: `Portfolio Contact: ${subject}`,
      reply_to: email,
      text: `Nouveau message du formulaire de contact du portfolio :

Expediteur: ${name}
Email: ${email}
Sujet: ${subject}

Message :

${message}

---
Envoi du: ${new Date().toLocaleString()}`.trim(),
    });

    if (error) {
      console.error("[resend error]", error);
      return res.status(500).json({ error: error.message || "Erreur lors de l'envoi" });
    }

    res.status(200).json({
      success: true,
      id: data?.id,
      message: "Message envoye avec succes",
    });
  } catch (error: any) {
    console.error("[resend catch error]", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
