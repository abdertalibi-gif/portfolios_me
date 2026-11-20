import { type Request, type Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createResendEmail(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Service de email non configuré - clé RESEND_API_KEY manquante" });
    }

    // Validate email format
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
      text: `
Nouveau message du formulaire de contact du portfolio :

Expéditeur: ${name}
Email: ${email}
Sujet: ${subject}

Message :
${message}

---
Envoi du: ${new Date().toLocaleString()}
      `.trim(),
    });

    if (error) {
      console.error("[resend error]", error);
      return res.status(500).json({ error: error.message || "Erreur lors de l'envoi" });
    }

    res.status(200).json({ 
      success: true, 
      id: data?.id,
      message: "Message envoyé avec succès" 
    });
  } catch (error: any) {
    console.error("[resend catch error]", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}