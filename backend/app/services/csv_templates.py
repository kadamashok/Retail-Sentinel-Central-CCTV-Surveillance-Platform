import csv
import io


def build_store_onboarding_template_csv() -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "store_code",
            "store_name",
            "city",
            "store_type",
            "dvr_ip",
            "dvr_port",
            "username",
            "password",
            "dvr_brand",
            "channels",
        ]
    )
    writer.writerow(
        [
            "CR001",
            "Croma Thane",
            "Thane",
            "Store",
            "192.168.1.10",
            "554",
            "admin",
            "password123",
            "Hikvision",
            "8",
        ]
    )
    return output.getvalue()
