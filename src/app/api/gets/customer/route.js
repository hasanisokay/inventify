import { dataFoundResponse, noDataFoundResponse, serverErrorResponse } from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const customerId = searchParams.get("id");

        const db = await dbConnect();
        const customerCollection = await db.collection("customers");

        const matchStage = { _id: new ObjectId(customerId) };

        const result = await customerCollection.aggregate([
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
                    billingAddress: 1,
                    billingStreet: 1,
                    billingCity: 1,
                    billingState: 1,
                    billingCountry: 1,
                    billingCode: 1,
                    shippingAddress: 1,
                    shippingStreet: 1,
                    shippingCity: 1,
                    shippingState: 1,
                    shippingCountry: 1,
                    shippingCode: 1,
                },
            },
        ]).toArray();

        if (result.length > 0) {
            return NextResponse.json(dataFoundResponse(result[0]));
        } else {
            return NextResponse.json(noDataFoundResponse);
        }
    } catch {
        return NextResponse.json(serverErrorResponse);
    }
};
