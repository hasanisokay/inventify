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
    const enrichedData = body?.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
      lastModifiedTime: new Date(item.lastModifiedTime),
    }));

    const customerCollection = await db.collection("customers");
    const result = await customerCollection.insertMany(enrichedData);
    if (result?.insertedCount > 0) {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
