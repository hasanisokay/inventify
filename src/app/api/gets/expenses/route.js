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
    const sort = searchParams.get("sort");

    const page = parseInt(searchParams.get("page"), 10) || 1;
    const limit = parseInt(searchParams.get("limit"), 10) || 10;
    const skip = (page - 1) * limit;

    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);

    const expenseCollection = await db.collection("expenses");
    const matchStage = { orgId };

    if (category) {
      matchStage.$or = [
        { category: category },
        { "itemizedExpenses.category": category },
      ];
    }


    const sortField =
      sort === "newest" || sort === "oldest"
        ? "date"
        : sort === "name_asc" || sort === "name_dsc"
        ? "customer.firstName"
        : sort === "highest_expense" || sort === "lowest_expense"
        ? "total"
        : "date";

    let sortOrder = -1;
    if (sort === "name_dsc" || sort === "oldest" || sort === "lowest_expense") {
      sortOrder = 1;
    }
console.log({sortField, sortOrder})
    const result = await expenseCollection
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
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Now, apply the keyword search after the lookup stage
        {
          $match: keyword
            ? {
                $or: [
                  { reference: { $regex: keyword, $options: "i" } },
                  { category: { $regex: keyword, $options: "i" } },
                  { note: { $regex: keyword, $options: "i" } },
                  {
                    "itemizedExpenses.category": {
                      $regex: keyword,
                      $options: "i",
                    },
                  },
                  {
                    "itemizedExpenses.note": { $regex: keyword, $options: "i" },
                  },
                  { "customer.firstName": { $regex: keyword, $options: "i" } },
                  { "customer.lastName": { $regex: keyword, $options: "i" } },
                ],
              }
            : {}, // If no keyword, don't filter
        },
        {
          $project: {
            _id: 1,
            date: 1,
            itemized: 1,
            category: 1,
            amount: 1,
            currency: 1,
            note: 1,
            tax: 1,
            reference: 1,
            total: 1,
            itemizedExpenses: 1,
            customer: {
              firstName: "$customer.firstName",
              lastName: "$customer.lastName",
              billingAddress: "$customer.billingAddress",
              phone: "$customer.phone",
            },
          },
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const totalCount = await expenseCollection.countDocuments(matchStage);

    return NextResponse.json(
      dataFoundResponse({ expenses: result, totalCount })
    );
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(serverErrorResponse);
  }
};
