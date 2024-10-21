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
    const nameOnly = searchParams.get("titleOnly");
    const sort = searchParams.get("sort");
    const orgId = searchParams.get("orgId");
    const sortOrder = sort === "newest" ? -1 : 1;
    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);

    const customerCollection = await db.collection("customers");


    const matchStage = {orgId:orgId};

    if (keyword) {
      matchStage.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { billingAddress: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { facebookId: { $regex: keyword, $options: "i" } },
      ];
    }

    if (nameOnly) {
      const res = await customerCollection
        .find(matchStage, { projection: { _id: 1, firstName: 1, lastName: 1 } })
        .toArray();
      return NextResponse.json(dataFoundResponse(res));
    }

    const result = await customerCollection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "invoices",
            localField: "_id",
            foreignField: "customerId",
            as: "invoices",
          },
        },
        {
          $addFields: {
            totalDue: { $sum: "$invoices.due" },
            totalPaid: { $sum: "$invoices.paid" },
            currency: { $sum: "$invoices.currency" },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            phone: 1,
            companyName: 1,
            _id: 1,
            currency: 1,
            totalDue: 1,
            totalPaid: 1,
          },
        },
        { $sort: { createdTime: sortOrder } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const totalCount = await customerCollection.countDocuments(matchStage);

    return NextResponse.json(
      dataFoundResponse({ customers: result, totalCount })
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse);
  }
};
