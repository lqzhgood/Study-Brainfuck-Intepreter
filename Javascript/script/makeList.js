import fs from 'fs';
import path from 'path';

// const fs = require('fs');
// const path = require('path');

function copyBFiles(sourceDir, targetDir, ext = '.bf') {
    const files = [];
    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 读取源目录内容
    const items = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item.name);
        const targetPath = path.join(targetDir, item.name);

        if (item.isDirectory()) {
            // 递归处理子目录
            copyBFiles(sourcePath, targetPath);
        } else if (item.isFile() && sourcePath.endsWith(ext)) {
            // 复制符合条件的文件
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied: ${sourcePath} → ${targetPath}`);
            files.push(item.name);
        }
    }
    return files;
}

const files = copyBFiles('../source', './public/bf', '.bf');

fs.writeFileSync('./public/list.json', JSON.stringify(files));
