import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const activeOrgId = await getActiveOrg();
    const searchParams = req.nextUrl.searchParams;
    const itemId = searchParams.get("id");
    const sortOrder = parseInt(searchParams.get("sortOrder")) || -1;
    const db = await dbConnect();
    const invoiceCollection = await db.collection("invoices");
    const res = await invoiceCollection
      .aggregate([
        {
          $match: {
            "items.itemId": new ObjectId(itemId),
            orgId: activeOrgId,
          },
        },
        {
          $sort: {
            invoiceDate: sortOrder, 
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
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },        {
          $project: {
            invoiceNumber: 1,
            invoiceDate: 1,
            "items.name": 1,
            "items.unit": 1,
            "items.quantity": 1,
            "items.sellingPrice": 1,
            paidAmount: 1,
            dueAmount: 1,
            total: 1,
            customerId: 1,
            "customerDetails.firstName":1,
            "customerDetails.lastName":1,
            "customerDetails.billingAddress":1,
            "customerDetails.phone":1
          },
        },
        
      ])
      .toArray();

    if (res?.length > 0) {
      return NextResponse.json(dataFoundResponse(res));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch (er) {
    console.error(er);
    return NextResponse.json(serverErrorResponse);
  }
};
