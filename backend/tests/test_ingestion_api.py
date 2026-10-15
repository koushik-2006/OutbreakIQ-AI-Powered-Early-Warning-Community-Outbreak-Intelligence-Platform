import io
from datetime import date


def test_csv_ingestion_endpoint(client, analyst_token):
    csv_content = (
        "region_id,indicator,reporting_date,count\n"
        "REG-WEST-VAL,ILI,2025-05-10,32\n"
        "REG-WEST-VAL,RESPIRATORY_CLINIC,2025-05-10,4\n"  # < 5 count: privacy suppressed
    )
    files = {"file": ("test_surveillance.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    headers = {"Authorization": f"Bearer {analyst_token}"}

    res = client.post(
        "/api/v1/ingestion/csv",
        files=files,
        data={"source_id": "SRC-CSV-TEST"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["total_records"] == 2
    assert data["privacy_suppressed_cells"] == 1


def test_batch_ingestion_endpoint(client, analyst_token):
    payload = {
        "observations": [
            {
                "region_id": "REG-DOWNTOWN",
                "indicator": "GASTROINTESTINAL",
                "reporting_date": str(date.today()),
                "count": 18,
                "source_id": "SRC-CLINIC-01",
            },
            {
                "region_id": "REG-DOWNTOWN",
                "indicator": "GASTROINTESTINAL",
                "reporting_date": str(date.today()),
                "count": 2,  # Should be suppressed
                "source_id": "SRC-CLINIC-02",
            },
        ]
    }
    headers = {"Authorization": f"Bearer {analyst_token}"}
    res = client.post("/api/v1/ingestion/batch", json=payload, headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    # First item
    assert items[0]["is_suppressed"] is False
    assert items[0]["effective_count"] == 18
    # Second item
    assert items[1]["is_suppressed"] is True
    assert items[1]["effective_count"] is None
