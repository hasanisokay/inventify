import {
  dataFoundResponse,
  dbErrorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");
    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);

    const customerCollection = await db.collection("customers");

    const matchStage = { orgId: orgId };
    const result = await customerCollection
    .aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "customerId",
          as: "invoices",
        },
      },
      {
        $addFields: {
          totalDue: { $sum: "$invoices.dueAmount" },
          totalPaid: { $sum: "$invoices.paidAmount" },
          totalOrder: { $size: "$invoices" },
        },
      },
    ])
    .toArray();
  
    const totalCount = await customerCollection.countDocuments(matchStage);

    return NextResponse.json(
      dataFoundResponse({ customers: result, totalCount })
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse);
  }
};
