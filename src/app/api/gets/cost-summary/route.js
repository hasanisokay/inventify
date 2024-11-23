import dbConnect from "@/services/dbConnect.mjs"; // Adjust the import based on your project structure
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const orgId = await getActiveOrg();
    const searchParams = req.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json({ error: "Invalid date format." });
    }

    const db = await dbConnect();
    const timeDiff = (endDate - startDate) / (1000 * 3600 * 24 * 30); 
    let groupBy;
    let groupByForExpenses;
    let projectFields;

    if (timeDiff < 2) {
      groupBy = {
        $concat: [
          { $toString: { $year: "$invoiceDate" } },
          "-W",
          { $toString: { $isoWeek: "$invoiceDate" } },
        ], 
      };
      groupByForExpenses = {
        $concat: [
          { $toString: { $year: "$date" } },
          "-W",
          { $toString: { $isoWeek: "$date" } },
        ], 
      };
      projectFields = {
        week: 1,
        totalDue: 1,
        totalPaid: 1,
      };
    } else if (timeDiff < 12) {

      groupBy = {
        $concat: [
          { $toString: { $year: "$invoiceDate" } },
          "-",
          { $toString: { $month: "$invoiceDate" } },
        ], 
      };
      groupByForExpenses = {
        $concat: [
          { $toString: { $year: "$date" } },
          "-",
          { $toString: { $month: "$date" } },
        ],
      };
      projectFields = {
        month: 1,
        totalDue: 1,
        totalPaid: 1,
      };
    } else {
  
      groupBy = { $year: "$invoiceDate" };
      projectFields = {
        year: 1,
        totalDue: 1,
        totalPaid: 1,
      };
      groupByForExpenses = { $year: "$date" }; 
      projectFields = {
        year: 1,
        totalDue: 1,
        totalPaid: 1,
      };
    }


    const invoiceCollection = await db.collection("invoices");
    const invoiceResults = await invoiceCollection
      .aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startDate,
              $lte: endDate,
            },
            orgId: orgId,
          },
        },
        {
          $group: {
            _id: groupBy,
            totalDue: { $sum: "$dueAmount" },
            totalPaid: { $sum: "$paidAmount" },
          },
        },
        {
          $sort: { _id: 1 }, 
        },
        {
          $project: projectFields, 
        },
      ])
      .toArray();


    const expenseCollection = await db.collection("expenses");
    const expenseResults = await expenseCollection
      .aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
            orgId: orgId,
          },
        },
        {
          $group: {
            _id: groupByForExpenses,
            totalExpenses: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 }, 
        },
        {
          $project: {
            _id:1,
            totalExpenses: 1,
          },
        },
      ])
      .toArray();


    const response = {
      success: true,
      invoiceData: invoiceResults,
      expenseData: expenseResults,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching cost summary:", error);
    return NextResponse.json({ success: false, message: "Server error." });
  }
};
