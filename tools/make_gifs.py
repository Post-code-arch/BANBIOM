"""Assemble les images de tools/.frames/<scène>/ en assets/gifs/<scène>.gif (palette commune, sans tramage)."""
import sys, pathlib
from PIL import Image
fps=float(sys.argv[1]) if len(sys.argv)>1 else 12.5
root=pathlib.Path(__file__).resolve().parent; out=root.parent/"assets"/"gifs"; out.mkdir(parents=True,exist_ok=True)
for d in sorted((root/".frames").iterdir()):
    files=sorted(d.glob("*.png"))
    if not files: continue
    frames=[Image.open(f).convert("RGB") for f in files]
    # palette commune tirée de quelques images réparties
    sample=Image.new("RGB",(frames[0].width,frames[0].height*4))
    for k,i in enumerate([len(frames)*j//4 for j in range(1,5)]): sample.paste(frames[min(i,len(frames)-1)],(0,frames[0].height*k))
    pal=sample.quantize(colors=128,method=Image.Quantize.MEDIANCUT)
    q=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in frames]
    dst=out/(d.name+".gif")
    q[0].save(dst,save_all=True,append_images=q[1:],duration=round(1000/fps),loop=0,optimize=True,disposal=1)
    print(dst.relative_to(root.parent), len(q), "images", round(dst.stat().st_size/1e6,2), "Mo")
