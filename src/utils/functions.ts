import * as fs   from "fs";
import * as path from "path";

export const copyDir  = (src, dest) => {
    fs.mkdirSync(dest);
    let entries = fs.readdirSync(src);

    for (let entry of entries) {
        let srcPath = path.join(src, entry);
        let destPath = path.join(dest, entry);
        // Assuming no folders for now
        fs.copyFileSync(srcPath, destPath);
    }
}