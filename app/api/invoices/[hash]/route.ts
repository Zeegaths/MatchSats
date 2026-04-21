import { NextRequest, NextResponse } from "next/server"
import { checkInvoice } from "@/lib/lnbits"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params
  const status = await checkInvoice(hash)
  return NextResponse.json({ status })
}
