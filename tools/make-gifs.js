/* Capture les images des animations explicatives (tools/gifs.html) puis les assemble en GIF via tools/make_gifs.py.
   Usage : python3 -m http.server 8000 (à la racine) puis  node tools/make-gifs.js  (Playwright requis). */
const path=require("path"), fs=require("fs"), {execFileSync}=require("child_process");
let pw; try{ pw=require("playwright"); }catch(e){ pw=require("/opt/node22/lib/node_modules/playwright"); }
const FPS=12.5, OUT=path.join(__dirname,".frames"), URL=process.env.URL||"http://localhost:8000/tools/gifs.html";
(async()=>{ const b=await pw.chromium.launch(), p=await b.newPage({viewport:{width:1000,height:720}});
  p.on("pageerror",e=>console.log("ERR",e.message));
  await p.goto(URL); await p.evaluate(()=>{ window.CAPTURE=true; return window.ready; }); await p.waitForTimeout(300);
  for(const name of (process.argv[2]?process.argv.slice(2):["voronoi","motion","grid"])){
    const dir=path.join(OUT,name); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
    const dur=await p.evaluate(n=>SCENES[n].dur,name), n=Math.round(dur*FPS);
    for(let i=0;i<n;i++){ const url=await p.evaluate(([nm,t])=>{ render(nm,t); return document.getElementById("c").toDataURL("image/png"); },[name,i/FPS]);
      fs.writeFileSync(path.join(dir,String(i).padStart(4,"0")+".png"),Buffer.from(url.split(",")[1],"base64")); }
    console.log(name,n,"images"); }
  await b.close();
  execFileSync("python3",[path.join(__dirname,"make_gifs.py"),String(FPS)],{stdio:"inherit"}); })();
