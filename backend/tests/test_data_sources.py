def test_list_data_sources(client):
    res = client.get("/api/v1/data-sources")
    assert res.status_code == 200
    sources = res.json()
    assert isinstance(sources, list)
    assert len(sources) >= 4

    for s in sources:
        assert "id" in s
        assert "name" in s
        assert "source_type" in s
        assert "is_simulated" in s
        assert "status" in s
        # Hackathon transparency check: simulated sources must be truthfully declared
        if "Simulated" in s["name"] or s["id"] in ("SRC-SYNDROMIC-01", "SRC-PHARM-01", "SRC-EDU-01", "SRC-LAB-01"):
            assert s["is_simulated"] is True


def test_get_data_source_detail(client):
    res = client.get("/api/v1/data-sources/SRC-SYNDROMIC-01")
    assert res.status_code == 200
    source = res.json()
    assert source["id"] == "SRC-SYNDROMIC-01"
    assert source["data_quality_score"] > 90.0

    not_found = client.get("/api/v1/data-sources/INVALID-SOURCE-ID")
    assert not_found.status_code == 404
