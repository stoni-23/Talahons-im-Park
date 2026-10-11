cp /storage/emulated/0/Pictures/Photoroom/menu-schild{1,2,3}.webp public/assets/menu/
node -e '
const fs = require("fs");
const file = "src/components/game-screen.tsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/menu-schild1\.png/g, "menu-schild1.webp")
     .replace(/menu-schild2\.png/g, "menu-schild2.webp")
     .replace(/menu-schild3\.png/g, "menu-schild3.webp");
fs.writeFileSync(file, c, "utf8");
'
npm run build
