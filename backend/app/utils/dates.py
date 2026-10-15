from datetime import date, datetime, timedelta, timezone
from typing import Optional, Tuple


def utc_now() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def parse_date(date_str: str) -> date:
    """Parse YYYY-MM-DD string to date."""
    if isinstance(date_str, date):
        return date_str
    return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()


def format_date(d: date) -> str:
    """Format date to YYYY-MM-DD."""
    return d.strftime("%Y-%m-%d")


def get_rolling_window_dates(
    end_date: Optional[date] = None, window_days: int = 28
) -> Tuple[date, date]:
    """Return (start_date, end_date) for a historical rolling window."""
    target_end = end_date or utc_now().date()
    start_date = target_end - timedelta(days=window_days)
    return start_date, target_end


def is_within_cooldown(
    last_event_time: datetime, cooldown_hours: int = 24
) -> bool:
    """Check if the given event time occurred within the cooldown window."""
    now = utc_now()
    if last_event_time.tzinfo is None:
        last_event_time = last_event_time.replace(tzinfo=timezone.utc)
    return (now - last_event_time) < timedelta(hours=cooldown_hours)
