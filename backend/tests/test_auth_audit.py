from app.core.security import hash_password, verify_password


def test_password_hashing():
    pw = "supersecret123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_login_success(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "dr_chen", "password": "epidemiologist123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "EPIDEMIOLOGIST"
    assert data["username"] == "dr_chen"


def test_login_failure(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "dr_chen", "password": "incorrect_password"},
    )
    assert res.status_code == 401
    assert "Invalid username or password" in res.json()["error"]["message"]


def test_current_user_me(client, epidemiologist_token):
    headers = {"Authorization": f"Bearer {epidemiologist_token}"}
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    user = res.json()
    assert user["username"] == "dr_chen"
    assert user["role"] == "EPIDEMIOLOGIST"
    assert "Sarah Chen" in user["full_name"]


def test_audit_logs_endpoint(client, analyst_token, viewer_token):
    # Viewer cannot access audit logs
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
    forbidden_res = client.get("/api/v1/audit/logs", headers=viewer_headers)
    assert forbidden_res.status_code == 403

    # Analyst can access audit logs
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    success_res = client.get("/api/v1/audit/logs", headers=analyst_headers)
    assert success_res.status_code == 200
    data = success_res.json()
    assert "items" in data
    assert "total" in data
