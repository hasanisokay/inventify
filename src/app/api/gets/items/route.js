import {
  dataFoundResponse,
  dbErrorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const cookieStore = cookies();

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
    const matchStage = {orgId};

    if (category) {
      matchStage.category = category;
    }

    if (keyword) {
      matchStage.$or = [
        { description: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
      ];
    }
    if (nameOnly) {
      const res = await itemCollection
        .find(matchStage, {
          projection: { _id: 1, name: 1, sellingPrice: 1, unit: 1, taxes: 1 },
        })
        .toArray();
      return NextResponse.json(dataFoundResponse(res));
    }

    const result = await itemCollection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "invoices",
            localField: "_id",
            foreignField: "items.itemId",
            as: "invoices",
          },
        },
        { $unwind: { path: "$invoices", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$invoices.items",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            sellingPrice: { $first: "$sellingPrice" },
            unit: { $first: "$unit" },
            taxes: { $first: "$taxes" },
            lastModifiedTime: { $first: "$lastModifiedTime" },
            totalOrder: { $sum: "$invoices.items.quantity" },
          },
        },
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
        {
          $sort: { totalOrder: sortOrder },
        },
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
