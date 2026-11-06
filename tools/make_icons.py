"""生成 tabBar 图标（81x81 PNG，灰色 / 咖啡棕两套）。"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "tab")
os.makedirs(OUT, exist_ok=True)

S = 324  # 4x supersample
GRAY = (140, 128, 120, 255)
BROWN = (150, 95, 58, 255)


def draw_cup(d, c, w):
    # 杯身
    d.polygon([(86, 132), (238, 132), (220, 246), (104, 246)], outline=c, width=w)
    # 杯口
    d.line([(86, 132), (238, 132)], fill=c, width=w)
    # 把手（与杯身相接）
    d.arc([226, 150, 286, 214], start=-88, end=88, fill=c, width=w)
    # 碟子
    d.line([(74, 266), (250, 266)], fill=c, width=w)
    # 热气
    d.arc([120, 56, 160, 100], start=115, end=305, fill=c, width=w)
    d.arc([172, 56, 212, 100], start=115, end=305, fill=c, width=w)


def draw_receipt(d, c, w):
    d.rounded_rectangle([92, 62, 232, 262], radius=18, outline=c, width=w)
    for y in (120, 160, 200):
        d.line([(124, y), (200, y)], fill=c, width=w)


def draw_user(d, c, w):
    d.ellipse([116, 62, 208, 154], outline=c, width=w)
    d.arc([78, 168, 246, 320], start=180, end=360, fill=c, width=w)


ICONS = {"cup": draw_cup, "order": draw_receipt, "user": draw_user}


def build(name, fn, color, filename):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    fn(d, color, 14)
    img = img.resize((81, 81), Image.LANCZOS)
    path = os.path.join(OUT, filename)
    img.save(path, "PNG")
    return path


for key, fn in ICONS.items():
    build(key, fn, GRAY, "%s.png" % key)
    build(key, fn, BROWN, "%s-active.png" % key)

for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)))
