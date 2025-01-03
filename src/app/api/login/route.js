import {
  dbErrorResponse,
  invalidCredentialsResponse,
  serverErrorResponse,
  suspendedAccountResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/constants/constantsName.mjs";
export const POST = async (req) => {
  try {
    const body = await req.json();
    const db = await dbConnect();

    const userCollection = await db.collection("users");

    const user = await userCollection.findOne(
      { username: body?.username },
      {
        projection: {
          password: 1,
          _id: 1,
          username: 1,
          role: 1,
          status: 1,
          profilePictureUrl: 1,
          fullName: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(invalidCredentialsResponse);
    }

    const passwordMatch = await bcrypt.compare(
      body?.password,
      user?.password
    );
    if (!passwordMatch) {
      return NextResponse.json(invalidCredentialsResponse);
    }
    if(user.status==="suspended"){
      return NextResponse.json(suspendedAccountResponse);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_ENCRYPTION_KEY);
      const token = await new SignJWT({
        sub: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
        profilePictureUrl: user.profilePictureUrl,
        fullName: user.fullName,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("365d")
        .sign(secret);

      // setting cookies
      cookies().set({
        name: COOKIE_NAME,
        value: `Bearer ${token}`,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 365,
      });

      delete user.password;
      return NextResponse.json({
        status: 200,
        user,
        message: "Validated",
      });
    } catch {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
