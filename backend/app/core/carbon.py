"""
Carbon-efficient code tracking module.
Measures estimated CO2 impact of API calls and background tasks.
"""
import time
import structlog
from dataclasses import dataclass, field
from typing import Dict
from datetime import datetime, timezone

logger = structlog.get_logger()


@dataclass
class CarbonMetrics:
    """Tracks estimated carbon footprint of operations."""
    total_api_calls: int = 0
    total_processing_seconds: float = 0.0
    total_bytes_transferred: int = 0
    estimated_co2_grams: float = 0.0
    last_reset: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    # Average CO2 per kWh (global grid average ~475g CO2/kWh)
    CO2_PER_KWH: float = 475.0
    # Average server power consumption ~0.3 kW
    SERVER_POWER_KW: float = 0.3
    # Network transfer: ~0.06 kWh per GB
    NETWORK_KWH_PER_GB: float = 0.06

    def record_api_call(self, duration_seconds: float, bytes_transferred: int = 0):
        self.total_api_calls += 1
        self.total_processing_seconds += duration_seconds
        self.total_bytes_transferred += bytes_transferred

        # Compute energy: server time + network
        server_kwh = (duration_seconds / 3600) * self.SERVER_POWER_KW
        network_kwh = (bytes_transferred / (1024 ** 3)) * self.NETWORK_KWH_PER_GB
        co2 = (server_kwh + network_kwh) * self.CO2_PER_KWH
        self.estimated_co2_grams += co2

    def get_summary(self) -> Dict:
        return {
            "total_api_calls": self.total_api_calls,
            "total_processing_seconds": round(self.total_processing_seconds, 2),
            "total_bytes_transferred_mb": round(self.total_bytes_transferred / (1024 * 1024), 2),
            "estimated_co2_grams": round(self.estimated_co2_grams, 4),
            "trees_equivalent_offset": round(self.estimated_co2_grams / 21000, 6),
            "last_reset": self.last_reset,
        }

    def reset(self):
        self.total_api_calls = 0
        self.total_processing_seconds = 0.0
        self.total_bytes_transferred = 0
        self.estimated_co2_grams = 0.0
        self.last_reset = datetime.now(timezone.utc).isoformat()


# Global singleton
carbon_tracker = CarbonMetrics()
