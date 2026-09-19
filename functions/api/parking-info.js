function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function normalizeItems(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function onRequestGet(context) {
  try {
    const serviceKey = context.env.DATA_GO_KR_SERVICE_KEY;

    if (!serviceKey) {
      return json(
        { error: "Cloudflare Secret DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다." },
        500
      );
    }

    const requestUrl = new URL(context.request.url);
    const parkingCode = (requestUrl.searchParams.get("code") || "").trim();

    if (!/^[A-Za-z0-9_-]{1,20}$/.test(parkingCode)) {
      return json({ error: "올바른 주차장 코드가 필요합니다." }, 400);
    }

    const apiUrl =
      "https://apis.data.go.kr/B552587/ParkingInfoService_v2/getParkingInfoList_v2";

    const params = new URLSearchParams({
      serviceKey,
      pageNo: "1",
      numOfRows: "10",
      pParkGCd: parkingCode,
      resultType: "json"
    });

    const response = await fetch(apiUrl + "?" + params.toString());

    if (!response.ok) {
      throw new Error("공공데이터 API HTTP 오류 : " + response.status);
    }

    const data = await response.json();
    const resultCode = data?.response?.header?.resultCode;

    if (resultCode !== "00") {
      throw new Error(
        "공공데이터 API 오류 : " +
        (data?.response?.header?.resultMsg || resultCode || "UNKNOWN")
      );
    }

    const items = normalizeItems(data?.response?.body?.items?.item);

    if (items.length === 0) {
      return json({ error: "해당 주차장의 실시간 정보가 없습니다." }, 404);
    }

    return json({ item: items[0] });
  } catch (error) {
    console.error(error);

    return json(
      {
        error: "실시간 주차정보를 가져오지 못했습니다.",
        detail: error.message
      },
      502
    );
  }
}
