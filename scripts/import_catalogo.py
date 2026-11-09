import json
import re
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/img/img-ropa-y-modelos.zip"
OUTPUT = ROOT / "public/catalogo"
IMAGE_PATTERN = re.compile(r"_(\d{2})\.(?:jpg|jpeg|png)$", re.IGNORECASE)
DATE_PATTERN = re.compile(r"20\d{2}-\d{2}-\d{2}")
PRICE_PATTERN = re.compile(r"(?<!\d)(\d{2,3}[.,]\d{3})(?!\d)")


def category_for(label):
    value = label.casefold()
    if "vestid" in value:
        return "Vestidos"
    if "enterizo" in value:
        return "Enterizos"
    if "conjunto" in value:
        return "Conjuntos"
    if "blusa" in value or "bluson" in value or "básica" in value or "basica" in value or "camisa" in value or "buzo" in value:
        return "Blusas"
    if "body" in value or "bodi" in value or "corset" in value:
        return "Bodies"
    if "falda" in value:
        return "Faldas"
    return "Colección"


def label_for(filename):
    label = filename.removesuffix(Path(filename).suffix)
    label = re.sub(r"^unica_+", "", label, flags=re.IGNORECASE)
    label = DATE_PATTERN.split(label, maxsplit=1)[0]
    label = label.split("#", maxsplit=1)[0]
    label = re.sub(r"\$?\s*\d{2,3}[.,_ ]\d{3}", " ", label)
    label = label.replace("_", " ")
    label = re.sub(r"[^\w$]+", " ", label, flags=re.UNICODE)
    label = re.sub(r"\s+", " ", label).strip()
    label = re.sub(r"^(?:hermos[oa]s?|nuev[oa]+|new collection|nueva colecci[oó]n)\s+", "", label, flags=re.IGNORECASE)
    return (label or "Nueva referencia")[:76].strip()


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    groups = {}
    with ZipFile(SOURCE) as archive:
        images = [
            name for name in archive.namelist()
            if not name.endswith("/") and Path(name).suffix.lower() in {".jpg", ".jpeg", ".png"}
        ]
        for index, name in enumerate(images, start=1):
            filename = Path(name).name
            match = IMAGE_PATTERN.search(filename)
            group_key = filename[:match.start()] if match else filename
            group = groups.setdefault(group_key, {
                "id": f"ref-{len(groups) + 1:03}",
                "title": label_for(filename),
                "category": category_for(label_for(filename)),
                "date": (DATE_PATTERN.search(filename).group(0) if DATE_PATTERN.search(filename) else ""),
                "photos": [],
                "price": None,
            })
            image_path = OUTPUT / f"foto-{index:04}.jpg"
            with archive.open(name) as source, image_path.open("wb") as destination:
                destination.write(source.read())
            group["photos"].append(f"/catalogo/{image_path.name}")
            price_match = PRICE_PATTERN.search(filename)
            if price_match and group["price"] is None:
                group["price"] = int(re.sub(r"\D", "", price_match.group(1)))

    catalogue = sorted(
        groups.values(),
        key=lambda item: (item["title"] == "Nueva referencia", item["category"] == "Colección"),
    )
    (OUTPUT / "catalogo.json").write_text(
        json.dumps(catalogue, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    priced = sum(item["price"] is not None for item in catalogue)
    print(f"{len(images)} fotos en {len(catalogue)} referencias; {priced} con precio de origen.")


if __name__ == "__main__":
    main()