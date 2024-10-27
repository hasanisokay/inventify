import {
  dataFoundResponse,
  dbErrorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const category = searchParams.get("category");
    const orgId = searchParams.get("orgId");
    const nameOnly = searchParams.get("titleOnly");
    const sort = searchParams.get("sort");
    const sortOrder = -1;
    const page = parseInt(searchParams.get("page"), 10) || 1;
    const limit = parseInt(searchParams.get("limit"), 10) || 10;
    const skip = (page - 1) * limit;

    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);

    const itemCollection = await db.collection("invoices");
    const matchStage = { orgId };

    if (category) {
      matchStage.category = category;
    }
    let sorting = {};
    if (sort === "top-paid") {
      sorting.paidAmount = -1;
    } else if (sort === "top-due") {
      sorting.dueAmount = -1;
    } else {
      sorting.invoiceDate = -1;
    }
    const result = await itemCollection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            // This flattens the customer array
            path: "$customer",
            preserveNullAndEmptyArrays: true, // Optional: keeps invoices without customers
          },
        },
        {
          $project: {
            _id: 1,
            customer: {
              firstName: "$customer.firstName",
              lastName: "$customer.lastName",
            },
            subtotal: 1,
            discount: 1,
            invoiceDate: 1,
            invoiceNumber: 1,
            paidAmount: 1,
            dueAmount: 1,
            totalTax: 1,
          },
        },
        { $sort: sorting },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const totalCount = await itemCollection.countDocuments(matchStage);

    return NextResponse.json(
      dataFoundResponse({ invoices: result, totalCount })
    );
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(serverErrorResponse);
  }
};
