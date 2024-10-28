import { dataFoundResponse, noDataFoundResponse, serverErrorResponse } from "@/constants/responses.mjs"
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export const GET = async(req)=>{
    try{
        const searchParams = req.nextUrl.searchParams;
        const customerId = searchParams.get("id");
    const db = await dbConnect();
    const customerCollection = await db.collection("items");
    const res = await customerCollection.findOne({_id: new ObjectId(customerId)});

    if(res?._id){
        return NextResponse.json(dataFoundResponse(res));
    }else{
        return NextResponse.json(noDataFoundResponse)
    }
    }catch{
        return NextResponse.json(serverErrorResponse)
    }
}