import {
  dataFoundResponse,
  dbErrorResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const sortOrder = sort === "newest" ? -1 : 1;
    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
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
    const result = await itemCollection
      .find(matchStage, {
        projection: {
          type: 1,
          name: 1,
          sellingPrice: 1,
          unit: 1,
          category: 1,
          status: 1,
          _id: 1,
        },
      })
      .sort({ createdTime: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();
    let totalCount;
    totalCount = await itemCollection.countDocuments(matchStage);
    return NextResponse.json(
      dataFoundResponse({ customers: result, totalCount })
    );
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
