import {
  dataFoundResponse,
  dbErrorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");
    const keyword = searchParams.get("keyword");
    const nameOnly = searchParams.get("titleOnly");
    const sort = searchParams.get("sort");

    const sortField =
      sort === "spenders"
        ? "totalPaid"
        : sort === "debtors"
        ? "totalDue"
        : sort === "name_asc"
        ? "firstName"
        : sort === "name_dsc"
        ? "firstName"
        : "lastModifiedTime";

    let sortOrder = -1;
    if (sort === "name_dsc") {
      sortOrder = 1;
    }
console.log({sort, sortOrder})
    const page = parseInt(searchParams.get("page"));
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const db = await dbConnect();
    if (!db) return NextResponse.json(dbErrorResponse);
    if (!orgId) return NextResponse.json(unauthorizedResponse);

    const customerCollection = await db.collection("customers");

    const matchStage = { orgId: orgId };

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
    const defaultUser = {
      _id: new ObjectId("673e36b073f2016df8694fd9"),
      firstName: "Default",
      lastName: "Customer",
    };

    if (nameOnly) {
      const res = await customerCollection
        .find(
          {
            ...matchStage,
            $nor: [{ firstName: "Default", lastName: "Customer" }],
          },
          { projection: { _id: 1, firstName: 1, lastName: 1 } }
        )
        .toArray();
      const data = [defaultUser, ...res];
      return NextResponse.json(dataFoundResponse(data));
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
            totalDue: { $sum: "$invoices.dueAmount" },
            totalPaid: { $sum: "$invoices.paidAmount" },
            totalOrder: { $size: "$invoices" },
            // i need total order. invoices
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
            totalOrder: 1,
            lastModifiedTime: 1,
          },
        },
        { $sort: { [sortField]: sortOrder } },
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
