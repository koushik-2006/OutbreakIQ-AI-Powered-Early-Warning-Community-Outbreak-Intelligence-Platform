from datetime import date
from app.utils.enums import AlertReviewStatus, InvestigationOutcome, InvestigationStatus


def test_full_surveillance_pipeline_e2e(client, analyst_token, epidemiologist_token):
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    epi_headers = {"Authorization": f"Bearer {epidemiologist_token}"}

    today_str = str(date.today())

    # 1. Ingest aggregate observation
    obs_payload = {
        "region_id": "REG-EAST-SUB",
        "indicator": "RESPIRATORY_CLINIC",
        "reporting_date": today_str,
        "count": 110,  # Sudden spike well above baseline
        "source_id": "SRC-AMBULATORY-01",
    }
    obs_res = client.post("/api/v1/observations", json=obs_payload, headers=analyst_headers)
    assert obs_res.status_code == 201
    assert obs_res.json()["effective_count"] == 110

    # 2. Run detection analysis
    analysis_res = client.post(
        "/api/v1/analysis/run",
        json={
            "region_id": "REG-EAST-SUB",
            "indicator": "RESPIRATORY_CLINIC",
            "target_date": today_str,
        },
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert analysis["is_anomaly"] is True
    assert analysis["observed_value"] == 110

    # 3. Trigger alert evaluation (bypassing duplicate cooldown for testing)
    alert_eval_res = client.post(
        f"/api/v1/alerts/evaluate?region_id=REG-EAST-SUB&indicator=RESPIRATORY_CLINIC&target_date={today_str}&force=true",
        headers=analyst_headers,
    )
    assert alert_eval_res.status_code == 200
    alert_data = alert_eval_res.json()
    assert alert_data is not None
    alert_id = alert_data["id"]
    assert alert_id.startswith("ALT-")

    # 4. Fetch alert details
    alert_detail_res = client.get(f"/api/v1/alerts/{alert_id}")
    assert alert_detail_res.status_code == 200
    assert alert_detail_res.json()["region_id"] == "REG-EAST-SUB"

    # 5. Open case investigation by epidemiologist
    inv_payload = {
        "alert_id": alert_id,
        "title": "Eastern Suburbs Respiratory Surge Case Investigation",
        "initial_notes": "Surge of 110 visits detected; initiating sentinel clinic interviews.",
        "assigned_to": "dr_chen",
    }
    inv_create_res = client.post(
        "/api/v1/investigations", json=inv_payload, headers=epi_headers
    )
    assert inv_create_res.status_code == 201
    inv_data = inv_create_res.json()
    inv_id = inv_data["id"]
    assert inv_data["status"] == "OPEN"

    # 6. Add case note
    note_res = client.post(
        f"/api/v1/investigations/{inv_id}/notes",
        json={"note": "Clinic reports uptick in acute bronchitis cases among elder care residents."},
        headers=analyst_headers,
    )
    assert note_res.status_code == 200
    assert any("acute bronchitis" in item["details"] for item in note_res.json()["timeline"])

    # 7. Update status to IN_PROGRESS, then RESOLVED with outcome
    update_res = client.patch(
        f"/api/v1/investigations/{inv_id}",
        json={
            "status": InvestigationStatus.RESOLVED.value,
            "outcome": InvestigationOutcome.LOCALIZED_CLUSTER.value,
            "resolution_summary": "Elder care facility cluster confirmed and treated with prophylactic protocols.",
        },
        headers=epi_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "RESOLVED"
    assert update_res.json()["outcome"] == "LOCALIZED_CLUSTER"

    # 8. Verify dashboard reflects active monitoring
    dash_res = client.get("/api/v1/dashboard/summary")
    assert dash_res.status_code == 200
    assert dash_res.json()["total_regions_monitored"] >= 5
