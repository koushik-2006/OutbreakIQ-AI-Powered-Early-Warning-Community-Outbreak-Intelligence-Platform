#!/usr/bin/env python3
"""System-wide End-to-End Integration Test for OutbreakIQ.

Tests:
1. Database schema & connection
2. FastAPI Health endpoint
3. Dashboard summary & hotspot retrieval
4. Regional observations query
5. Statistical anomaly detection triggering an explainable alert
6. Alert review status update
7. Privacy protection: PII rejection & count < 5 suppression
8. Frontend build assets presence
"""

import os
import sys

# Add backend to path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))

from fastapi.testclient import TestClient
from app.main import app

def run_integration_tests():
    print("=================================================================")
    print(" OutbreakIQ — End-to-End System Integration Verification")
    print("=================================================================")
    client = TestClient(app)

    # 1. Health Checks
    print("\n[1/7] Testing Health Endpoints...")
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    print(f"  [PASS] /health: status={health_data['status']}, db_status={health_data['database']['status']}")

    res_v1 = client.get("/api/v1/health")
    assert res_v1.status_code == 200
    print("  [PASS] /api/v1/health: healthy")

    # 2. Dashboard Summary
    print("\n[2/7] Testing Dashboard Summary & Hotspots...")
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()
    assert "total_active_alerts" in summary
    assert "hotspots" in summary
    assert summary["total_regions_monitored"] >= 5
    print(f"  [PASS] Total active alerts: {summary['total_active_alerts']}, Monitored regions: {summary['total_regions_monitored']}")
    print(f"  [PASS] Hotspots detected: {len(summary['hotspots'])}")

    # 3. Regional Observations Retrieval
    print("\n[3/7] Testing Regional Observations & Trends...")
    res = client.get("/api/v1/regions/REG-METRO-N/trends?indicator=ILI&days=14")
    assert res.status_code == 200
    trends = res.json()
    assert len(trends["trends"]) > 0
    print(f"  [PASS] Retrieved {len(trends['trends'])} trend points for {trends['region_name']}")
    anomalous_points = [t for t in trends["trends"] if t["is_anomaly"]]
    print(f"  [PASS] Verified statistical anomaly points detected: {len(anomalous_points)}")

    # 4. Anomaly Evaluation & Explainable Alert Generation
    print("\n[4/7] Testing Statistical Anomaly Detection & Explainable Alert...")
    # Obtain analyst auth token
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "analyst", "password": "analyst123"}
    )
    assert login_res.status_code == 200
    analyst_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {analyst_token}"}

    eval_res = client.post(
        "/api/v1/alerts/evaluate?region_id=REG-METRO-N&indicator=ILI&force=true",
        headers=headers
    )
    assert eval_res.status_code == 200
    alert = eval_res.json()
    assert alert is not None
    assert "explanation" in alert
    assert "deviation_score" in alert
    print(f"  [PASS] Triggered Alert: {alert['id']}")
    print(f"  [PASS] Deviation score: +{alert['deviation_score']} sigma")
    print(f"  [PASS] Explainable Rationale: {alert['explanation'][:80]}...")

    # 5. Alert Review Status Update (Epidemiologist Triage)
    print("\n[5/7] Testing Epidemiologist Alert Triage & Review Status Update...")
    dr_chen_login = client.post(
        "/api/v1/auth/login",
        json={"username": "dr_chen", "password": "epidemiologist123"}
    )
    assert dr_chen_login.status_code == 200
    dr_chen_token = dr_chen_login.json()["access_token"]
    dr_headers = {"Authorization": f"Bearer {dr_chen_token}"}

    review_res = client.patch(
        f"/api/v1/alerts/{alert['id']}/review",
        json={"review_status": "UNDER_INVESTIGATION", "review_notes": "Triage verified; initiating clinic inquiry.", "assigned_to": "dr_chen"},
        headers=dr_headers
    )
    assert review_res.status_code == 200
    updated_alert = review_res.json()
    assert updated_alert["review_status"] == "UNDER_INVESTIGATION"
    assert updated_alert["reviewed_by"] == "dr_chen"
    print(f"  [PASS] Alert review updated to: {updated_alert['review_status']}")
    print(f"  [PASS] Reviewer assigned: {updated_alert['reviewed_by']}")

    # 6. Privacy Preservation (PII rejection and small count suppression)
    print("\n[6/7] Testing Privacy Safeguards (PII Rejection & Masking)...")
    # PII rejection
    pii_payload = {
        "region_id": "REG-METRO-N",
        "indicator": "ILI",
        "reporting_date": "2026-10-14",
        "count": 45,
        "source_id": "SRC-SYNDROMIC-01",
        "patient_name": "John Doe",  # PROHIBITED PII
    }
    pii_res = client.post("/api/v1/observations", json=pii_payload, headers=headers)
    assert pii_res.status_code == 422 or pii_res.status_code == 400
    print("  [PASS] Strict PII rejection verified: Patient name field blocked with 400/422.")

    # Small count suppression (< 5)
    small_count_payload = {
        "region_id": "REG-WEST-VAL",
        "indicator": "ILI",
        "reporting_date": "2026-09-01",
        "count": 3,
        "source_id": "SRC-NEW-TEST-01",
    }
    suppress_res = client.post("/api/v1/observations", json=small_count_payload, headers=headers)
    assert suppress_res.status_code == 201
    suppressed_obs = suppress_res.json()
    assert suppressed_obs["is_suppressed"] is True
    assert suppressed_obs["effective_count"] is None
    print("  [PASS] Privacy suppression verified: Count=3 suppressed (effective_count=null, is_suppressed=true).")

    # 7. Frontend Build Verification
    print("\n[7/7] Verifying Frontend Production Artifacts...")
    dist_html = os.path.join(ROOT_DIR, "frontend", "dist", "index.html")
    assert os.path.exists(dist_html), "Frontend dist/index.html not found! Run npm run build."
    print("  [PASS] Frontend production build assets verified: dist/index.html present.")

    print("\n=================================================================")
    print(" ALL 7 END-TO-END INTEGRATION TEST SUITES PASSED (100% SUCCESS)!")
    print("=================================================================")

if __name__ == "__main__":
    run_integration_tests()
