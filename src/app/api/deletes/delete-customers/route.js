import {

  dataUpdateResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
    const body = await req.json();
    const ids = body.ids; // Array of customer IDs
    
    // Ensure the ids array is not empty
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        status: 400,
        message: "No customer IDs provided for deletion.",
      });
    }

    const db = await dbConnect();
    const customerCollection = await db.collection("customers");

    // Delete all customers whose IDs are in the array
    const res = await customerCollection.deleteMany({
      _id: { $in: ids.map(id => new ObjectId(id)) }
    });

    // Check if any customers were deleted
    if (res.deletedCount > 0) {
      return NextResponse.json(dataUpdateResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
