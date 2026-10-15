def test_dashboard_summary_endpoint(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_active_alerts" in data
    assert "alerts_by_severity" in data
    assert "hotspots" in data
    assert "data_freshness_status" in data
    assert data["system_status"] == "OPERATIONAL"


def test_list_regions_endpoint(client):
    response = client.get("/api/v1/regions")
    assert response.status_code == 200
    regions = response.json()
    assert isinstance(regions, list)
    assert len(regions) >= 5
    first = regions[0]
    assert "id" in first
    assert "name" in first
    assert "active_alerts_count" in first


def test_get_region_detail_endpoint(client):
    response = client.get("/api/v1/regions/REG-METRO-N")
    assert response.status_code == 200
    reg = response.json()
    assert reg["id"] == "REG-METRO-N"
    assert "Metro North" in reg["name"]

    not_found = client.get("/api/v1/regions/NON-EXISTENT-XYZ")
    assert not_found.status_code == 404


def test_get_region_trends_endpoint(client):
    response = client.get("/api/v1/regions/REG-METRO-N/trends?indicator=ILI&days=14")
    assert response.status_code == 200
    trends_data = response.json()
    assert trends_data["region_id"] == "REG-METRO-N"
    assert "trends" in trends_data
    assert len(trends_data["trends"]) > 0


def test_get_region_alerts_endpoint(client):
    response = client.get("/api/v1/regions/REG-METRO-N/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_admin_create_region(client, admin_token, viewer_token):
    # Non-admin viewer should be forbidden (403)
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
    forbidden_res = client.post(
        "/api/v1/regions",
        json={"id": "REG-NEW-01", "name": "New Jurisdiction", "code": "NJ-01"},
        headers=viewer_headers,
    )
    assert forbidden_res.status_code == 403

    # Admin should succeed (201)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    success_res = client.post(
        "/api/v1/regions",
        json={"id": "REG-NEW-01", "name": "New Jurisdiction", "code": "NJ-01", "population": 50000},
        headers=admin_headers,
    )
    assert success_res.status_code == 201
    assert success_res.json()["id"] == "REG-NEW-01"
