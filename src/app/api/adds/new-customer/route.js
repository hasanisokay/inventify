import {
  dataAddedResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const db = await dbConnect();
    const customerCollection = await db.collection("customers");
    const result = await customerCollection.insertOne(body);
    if (result.insertedId) {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};