// src/app/api/admin/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // prevent multiple admins
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 400 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await Admin.create({
      email: "trustxchange2477@gmail.com",
      password:"Osaka266" // will be hashed by pre-save hook
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        email: admin.email,
        password: admin.password
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Admin seed error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
