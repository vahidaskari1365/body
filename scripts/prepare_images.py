#!/usr/bin/env python3
"""Download and optimize landing page images -> public/images/"""
import os, urllib.request
from PIL import Image

OUT = "/home/z/my-project/public/images"
os.makedirs(OUT, exist_ok=True)

JOBS = [
    # (url, filename, max_width, square_crop_for_avatar)
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a3b72c1a2ea8.jpg", "hero-bg.jpg", 1920, False),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d2d220c66044.jpg", "coach.jpg", 1100, False),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/34b936bca275.jpg", "athlete.jpg", 1100, False),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/59c4a3916dba.jpg", "cta-bg.jpg", 1600, False),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5bcae38c943e.jpg", "strength.jpg", 900, False),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d28589854341.jpg", "avatar-1.jpg", 400, True),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9fd979c7aaa1.jpg", "avatar-2.jpg", 400, True),
    ("https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f8abdb28474c.jpg", "avatar-3.jpg", 400, True),
]

for url, name, maxw, square in JOBS:
    tmp = f"/tmp/dl-{name}"
    urllib.request.urlretrieve(url, tmp)
    im = Image.open(tmp).convert("RGB")
    w, h = im.size
    if square:
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    if im.width > maxw:
        im = im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, "JPEG", quality=74, optimize=True, progressive=True)
    kb = os.path.getsize(path) // 1024
    print(f"OK {name:16s} {im.width}x{im.height}  {kb}KB")

print("DONE")
