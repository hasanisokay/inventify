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
    } else if (sort === "oldest") {
      sorting.invoiceDate = 1;
    } else {
      sorting.invoiceDate = -1;
    }

    // Start with the aggregation pipeline
    const pipeline = [
      { $match: matchStage }, // Match invoices based on orgId and category (if provided)
      {
        $lookup: {
          from: "customers", // Join with the customers collection
          localField: "customerId", // Join using the customerId field from invoices
          foreignField: "_id", // Join with _id in the customers collection
          as: "customer", // Resulting customer data will be in the "customer" array
        },
      },
      {
        $unwind: {
          path: "$customer", // Flatten the customer array so we can access customer fields directly
          preserveNullAndEmptyArrays: true, // Keep invoices without customers
        },
      },
    ];

    // If there's a keyword, filter by customer firstName and lastName
    if (keyword) {
      pipeline.push({
        $match: {
          $or: [
            { 'items.name': { $regex: keyword, $options: "i" } },
            { 'customer.firstName': { $regex: keyword, $options: "i" } },
            { 'customer.lastName': { $regex: keyword, $options: "i" } },
          ],
        },
      });
    }

    // Add project stage to shape the data we need
    pipeline.push({
      $project: {
        _id: 1,
        customer: {
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          billingAddress: "$customer.billingAddress",
          phone: "$customer.phone",
        },
        subtotal: 1,
        discount: 1,
        invoiceDate: 1,
        invoiceNumber: 1,
        paidAmount: 1,
        dueAmount: 1,
        totalTax: 1,
        total: 1,
        shippingCharge: 1,
      },
    });

    // Sorting stage
    pipeline.push({ $sort: sorting });

    // Pagination: skip and limit
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute the aggregation pipeline
    const result = await itemCollection.aggregate(pipeline).toArray();

    const totalCount = await itemCollection.countDocuments(matchStage);

    return NextResponse.json(
      dataFoundResponse({ invoices: result, totalCount })
    );
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(serverErrorResponse);
  }
};
