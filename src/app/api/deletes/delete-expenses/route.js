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
    const ids = body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        message: "No valid IDs provided for deletion.",
        status: 400
      });
    }

    const db = await dbConnect();
    const customerCollection = await db.collection("expenses");
    const objectIds = ids.map(id => new ObjectId(id));

    const res = await customerCollection.deleteMany({
      _id: { $in: objectIds },
    });

    if (res.deletedCount > 0) {
      return NextResponse.json(dataDeletedResponse); 
    } else {
      return NextResponse.json(dataDeleteErrorResponse); 
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse); 
  }
};
