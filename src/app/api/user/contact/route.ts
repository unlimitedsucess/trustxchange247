import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";
import { transporter } from "@/lib/email";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://trusxchange.com",
  "https://www.trusxchange.com",
];

function getCorsHeaders(origin: string | null) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");

    // ❌ Block unauthorized origins
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { message: "Not allowed by CORS policy" },
        { status: 403 }
      );
    }

    await connectDB();

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // Route payload explicitly through Unified ZeptoMail Transporter
    await transporter.sendMail({
      from: `"TrustXchange247 Contact" <support@trusxchange.com>`,
      replyTo: `"${name}" <${email}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`,
      html: `
        <p><strong>New contact message</strong></p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</li>
        </ul>
      `,
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 201, headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
