import fs from 'fs';
import path from 'path';

const inputFilePath = "./../app";

// const searchString = "B99D84A";
const searchString = "Moreau";

// Lists all files in a directory in Node.js recursively in a synchronous fashion
function listFiles(dir: string, pattern: RegExp): string[] {
    const files: string[] = fs.readdirSync(dir);
    let result: string[] = [];

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            result = [...result, ...listFiles(filePath, pattern)];
        }
        else if (pattern.test(file)) {
            result = [...result, filePath];
        }
    });

    return result;
};

function main() {
    const allFiles = listFiles(inputFilePath, /.*/);
    allFiles.forEach((file) => {
        const buffer = fs.readFileSync(file);
        
        /*
        const hex = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
        const hexPos = hex.search(searchString);
        if (hexPos >= 0) {
            console.log(`${file} contains byte sequence 0x${searchString} at position ${hexPos}`);
        }
        */

        try {
            const ascii = new TextDecoder("windows-1252").decode(buffer);
            const asciiPos = ascii.search(searchString);
            if (asciiPos >= 0) {
                console.log(`${file} contains substring ${searchString} at position ${asciiPos}`);
            }
        } catch (e){}
    });
}

main();