import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const db = await dbConnect();
    const itemsCollection = await db.collection("expenses");

    // Aggregation pipeline to get distinct categories from both top-level and itemizedExpenses array
    const pipeline = [
      {
        $facet: {
          // Get distinct categories from the top-level "category" field
          topLevelCategories: [
            { $match: { category: { $exists: true } } },
            { $group: { _id: "$category" } },
          ],
          // Get distinct categories from "itemizedExpenses" array
          itemizedExpensesCategories: [
            { $unwind: "$itemizedExpenses" },
            { $match: { "itemizedExpenses.category": { $exists: true } } },
            { $group: { _id: "$itemizedExpenses.category" } },
          ],
        },
      },
      {
        $project: {
          allCategories: {
            $setUnion: ["$topLevelCategories._id", "$itemizedExpensesCategories._id"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          categories: "$allCategories",
        },
      },
    ];

    const result = await itemsCollection.aggregate(pipeline).toArray();
    const categories = result.length > 0 ? result[0].categories : [];

    if (categories.length > 0) {
      return NextResponse.json(dataFoundResponse(categories));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse);
  }
};
