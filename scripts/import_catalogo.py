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
SIZE_PATTERN = re.compile(r"talla[_ ]+(?:[uú]nica|\d+)", re.IGNORECASE)
PRESENTATION_NAMES = (
    ("conjunto_manga_larga_hilo", "Conjunto manga larga", "Conjuntos"),
    ("básica_awnd", "Básica AWND", "Blusas"),
    ("buzo_licra_tipo", "Buzo Americana", "Blusas"),
    ("body_tela_destellante", "Body destellante", "Bodies"),
    ("vestido_disponible_azul", "Vestido disponible", "Vestidos"),
    ("bluson_elaborado_tela_qatar", "Blusón Qatar", "Blusas"),
    ("body_alo_tela_rib", "Body Alo Rib", "Bodies"),
    ("ref_beirut", "Vestido Beirut", "Vestidos"),
)
MATERIALS = (
    ("licra pesada", "Licra pesada"),
    ("burda perchada", "Burda perchada"),
    ("mallatex", "Mallatex"),
    ("mayatex", "Mayatex"),
    ("blonda", "Blonda"),
    ("suplex", "Suplex"),
    ("licra", "Licra"),
    ("rib", "Rib"),
    ("hilo", "Hilo"),
    ("peluche", "Peluche"),
    ("qatar", "Tela Qatar"),
    ("destellante", "Tela destellante"),
    ("seamless", "Tipo seamless"),
    ("cuero", "Efecto cuero"),
    ("pasifica", "Tela Pasifica"),
)
COLOR_WORDS = (
    ("negro", "Negro"), ("negra", "Negro"), ("blanco", "Blanco"),
    ("blanca", "Blanco"), ("azul", "Azul"), ("rosado", "Rosado"),
    ("rosada", "Rosado"), ("rojo", "Rojo"), ("roja", "Rojo"),
    ("verde", "Verde"), ("amarillo", "Amarillo"), ("amarilla", "Amarillo"),
    ("café", "Café"), ("cafe", "Café"), ("lila", "Lila"),
    ("morado", "Morado"), ("beige", "Beige"), ("naranja", "Naranja"),
)


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
    return "Moda"


def presentation_for(filename, title):
    value = filename.casefold()
    for marker, name, category in PRESENTATION_NAMES:
        if marker in value:
            return name, category
    return title, category_for(title)


def details_for(filename):
    value = filename.casefold()
    details = []
    size_match = SIZE_PATTERN.search(value)
    if size_match:
        size = size_match.group(0).replace("_", " ").title()
        details.append("Talla " + size.split(maxsplit=1)[-1])
    for marker, label in MATERIALS:
        if marker in value:
            details.append(label)
    colors = []
    for marker, label in COLOR_WORDS:
        if marker in value and label not in colors:
            colors.append(label)
    return details, colors


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
            source_title = label_for(filename)
            title, category = presentation_for(filename, source_title)
            details, colors = details_for(filename)
            group = groups.setdefault(group_key, {
                "id": f"ref-{len(groups) + 1:03}",
                "title": title,
                "category": category,
                "sourceTitle": source_title,
                "details": details,
                "colors": colors,
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
        key=lambda item: (item["title"] == "Nueva referencia", item["category"] == "Moda"),
    )
    (OUTPUT / "catalogo.json").write_text(
        json.dumps(catalogue, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    priced = sum(item["price"] is not None for item in catalogue)
    print(f"{len(images)} fotos en {len(catalogue)} referencias; {priced} con precio de origen.")


if __name__ == "__main__":
    main()