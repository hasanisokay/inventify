import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const db = await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const itemsCollection = await db.collection("invoices");
    const invoice = await itemsCollection.findOne({ _id: new ObjectId(id) });
    
    if (invoice._id) {
      return NextResponse.json(dataFoundResponse(invoice));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse);
  }
};

