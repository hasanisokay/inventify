import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const orgId = await getActiveOrg();
    const searchParams = req.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit")) || 10;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Validate dates
    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json({ error: "Invalid date format." });
    }

    const db = await dbConnect();
    const invoiceCollection = await db.collection("invoices");
    const res = await invoiceCollection
      .aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startDate,
              $lte: endDate,
            },
            orgId: orgId,
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: "$customerDetails",
        },
        {
          $group: {
            _id: {
              firstName: "$customerDetails.firstName",
              lastName: "$customerDetails.lastName",
            },
            totalDueAmount: { $sum: "$dueAmount" },
            totalPaidAmount: { $sum: "$paidAmount" },
          },
        },
        {
          $match: {
            totalPaidAmount: { $gt: 0 },
          },
        },
        {
          $sort: { totalPaidAmount: -1 },
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    if (res?.length > 0) {
      return NextResponse.json(dataFoundResponse(res));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(serverErrorResponse);
  }
};
