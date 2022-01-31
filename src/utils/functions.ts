import * as fs   from "fs";
import * as path from "path";

export const copyDir  = (src, dest) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    const entries = fs.readdirSync(src, {withFileTypes: true});

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        // Assuming no folders for now
        entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
}