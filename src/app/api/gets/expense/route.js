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
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const db = await dbConnect();
    const customerCollection = await db.collection("expenses");
    const res = await customerCollection.findOne({
      _id: new ObjectId(id),
    });

    if (res?._id) {
      return NextResponse.json(dataFoundResponse(res));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
