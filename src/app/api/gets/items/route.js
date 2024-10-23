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
    const sortOrder = sort === "highest" ? -1 : 1;
    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);
    const itemCollection = await db.collection("items");
    const matchStage = {};

    if (category) {
      matchStage.category = category;
    }

    if (keyword) {
      matchStage.$or = [
        { description: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }
    if (nameOnly) {
      const res = await itemCollection
        .find(matchStage, {
          projection: { _id: 1, name: 1, sellingPrice: 1, unit: 1, taxes: 1 },
        }).toArray();
      return NextResponse.json(dataFoundResponse(res));
    }

    const result = await itemCollection
    .aggregate([
      // Match stage to filter items based on criteria (optional)
      { $match: matchStage },
  
      // Lookup invoices to include fields from invoices
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "items.itemId", // Use the correct field
          as: "invoices",
        },
      },
  
      // Unwind invoices to flatten the structure, preserving items without invoices
      { $unwind: { path: "$invoices", preserveNullAndEmptyArrays: true } },
  
      // Optionally unwind the items within invoices if needed
      { $unwind: { path: "$invoices.items", preserveNullAndEmptyArrays: true } },
  
      // Group back by item, aggregating necessary fields
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          sellingPrice: { $first: "$sellingPrice" },
          unit: { $first: "$unit" },
          taxes: { $first: "$taxes" },
          lastModifiedTime: { $first: "$lastModifiedTime" },
          totalOrder: { $sum: { $ifNull: ["$invoices.items.quantity", 0] } }, // Include total quantity, default to 0 if null
        },
      },
  
      // Project the fields you want in the final output
      {
        $project: {
          _id: 1,
          name: 1,
          sellingPrice: 1,
          unit: 1,
          taxes: 1,
          lastModifiedTime: 1,
          totalOrder: 1,
        },
      },
  
      // Sort the results
      {
        $sort: {totalOrder: sortOrder },
      },
  
      // Implement pagination
      { $skip: skip },
      { $limit: limit },
    ])
    .toArray();
    let totalCount;
    totalCount = await itemCollection.countDocuments(matchStage);
    return NextResponse.json(dataFoundResponse({ items: result, totalCount }));
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
