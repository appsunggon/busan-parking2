function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

function normalizeItems(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchPage(serviceKey, pageNo, numOfRows = 10) {
  const apiUrl =
    "https://apis.data.go.kr/B552587/ParkingInfoService_v2/getParkingList_v2";

  const params = new URLSearchParams({
    serviceKey,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
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

  return data;
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

    const firstData = await fetchPage(serviceKey, 1, 10);
    const body = firstData.response.body;
    const totalCount = Number(body.totalCount || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / 10));

    let items = normalizeItems(body?.items?.item);

    if (totalPages > 1) {
      const remaining = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          fetchPage(serviceKey, index + 2, 10)
        )
      );

      for (const pageData of remaining) {
        items = items.concat(
          normalizeItems(pageData?.response?.body?.items?.item)
        );
      }
    }

    return json({ items, totalCount });
  } catch (error) {
    console.error(error);

    return json(
      {
        error: "주차장 목록을 가져오지 못했습니다.",
        detail: error.message
      },
      502
    );
  }
}
