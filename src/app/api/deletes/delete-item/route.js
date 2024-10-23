import {
  dataDeletedResponse,
  dataDeleteErrorResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
      const body = await req.json();
      const id = body.id;
    const db = await dbConnect();
    const customerCollection = await db.collection("items");
    const res = await customerCollection.deleteOne({
      _id: new ObjectId(id)
    });
    if (res.deletedCount > 0) {
      return NextResponse.json(dataDeletedResponse);
    } else {
      return NextResponse.json(dataDeleteErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
