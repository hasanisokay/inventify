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

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const keyword = searchParams.get("keyword");
    const category = searchParams.get("category");
    const report = searchParams.get("report");

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
    const matchStage = { orgId };

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
      matchStage.status = "Active";

      const res = await itemCollection
        .find(matchStage, {
          projection: { _id: 1, name: 1, sellingPrice: 1, unit: 1, taxes: 1 },
        })
        .toArray();
      return NextResponse.json(dataFoundResponse(res));
    }
    let result;
    if (report === "true") {
      result = await itemCollection
        .aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: "invoices",
              localField: "_id", // Match the item _id
              foreignField: "items.itemId", // Ensure items in the invoice match
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
              status: { $first: "$status" },
              lastModifiedTime: { $first: "$lastModifiedTime" },
              totalOrder: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$invoices.items.itemId", "$_id"] }, // Ensure quantity is for this item
                        { $gte: ["$invoices.invoiceDate", startDate] },
                        { $lte: ["$invoices.invoiceDate", endDate] },
                      ],
                    },
                    "$invoices.items.quantity",
                    0,
                  ],
                },
              },
              totalAmount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$invoices.items.itemId", "$_id"] }, // Ensure match
                        { $gte: ["$invoices.invoiceDate", startDate] },
                        { $lte: ["$invoices.invoiceDate", endDate] },
                      ],
                    },
                    {
                      $multiply: [
                        "$invoices.items.quantity",
                        "$invoices.items.sellingPrice",
                      ],
                    }, // Calculate totalAmount
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              sellingPrice: 1,
              unit: 1,
              taxes: 1,
              status: 1,
              lastModifiedTime: 1,
              totalOrder: 1,
              totalAmount: 1,
            },
          },
          {
            $sort: { totalOrder: sortOrder },
          },
          { $skip: skip },
          { $limit: limit },
        ])
        .toArray();
    } else {
      result = await itemCollection
        .aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: "invoices",
              localField: "_id", // Match the item _id
              foreignField: "items.itemId", // Ensure items in the invoice match
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
              status: { $first: "$status" },
              lastModifiedTime: { $first: "$lastModifiedTime" },
              totalOrder: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$invoices.items.itemId", "$_id"] }, // Ensure quantity is for this item
                        { $gte: ["$invoices.invoiceDate", startDate] },
                        { $lte: ["$invoices.invoiceDate", endDate] },
                      ],
                    },
                    "$invoices.items.quantity",
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              sellingPrice: 1,
              unit: 1,
              taxes: 1,
              status: 1,
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
    }

    let totalCount;

    totalCount = await itemCollection.countDocuments(matchStage);
    return NextResponse.json(dataFoundResponse({ items: result, totalCount }));
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
