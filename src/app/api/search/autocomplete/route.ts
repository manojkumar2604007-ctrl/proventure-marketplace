import { NextRequest, NextResponse } from "next/server";
import { searchService } from "@/services/search.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("query") || "";

    const results = await searchService.getAutocomplete(q);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Autocomplete lookup failed",
      },
      { status: 500 }
    );
  }
}
