export async function GET() {
  try {
    const response = await fetch("https://api.bitflyer.com/v1/ticker?product_code=BTC_JPY", {signal: AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error("Unavailable");
    const data = await response.json();
    const timestamp = typeof data.timestamp === "string" ? data.timestamp.replace(/Z$/, "") + "Z" : "";
    if (data.product_code !== "BTC_JPY" || typeof data.ltp !== "number" || !Number.isFinite(data.ltp) || data.ltp <= 0 || !Number.isFinite(Date.parse(timestamp)) || Math.abs(Date.now() - Date.parse(timestamp)) > 15 * 60 * 1000) throw new Error("Invalid or stale rate");
    return Response.json({jpy: data.ltp, timestamp}, {headers: {"Cache-Control": "public, max-age=60"}});
  } catch {
    return Response.json({error: "BTC rate unavailable"}, {status:503,headers:{"Cache-Control":"no-store"}});
  }
}
