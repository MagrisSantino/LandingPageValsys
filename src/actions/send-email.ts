"use server"

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailAction(formData: { name: string; email: string; message: string }) {
  try {
    const { data, error } = await resend.emails.send({
      // Importante: Si aún no verificaste el dominio valsys.dev en Resend, 
      // usa "onboarding@resend.dev" como remitente (from). 
      // Una vez verificado en la plataforma, cámbialo a "contacto@valsys.dev".
      from: "Valsys <hello@valsys.dev>",
      to: ["hello@valsys.dev"],
      subject: `New Project Inquiry from ${formData.name}`,
      replyTo: formData.email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Internal server error" };
  }
}