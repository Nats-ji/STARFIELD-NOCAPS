import * as fs from "fs";
import * as child_process from "child_process";
import wordlist from "wordlist-english";

let englishWords = [];
englishWords = englishWords.concat(wordlist["english"], wordlist["english/american"]);

{
    // exclude words
    let excludes = ["em", "id"];
    for (const word of excludes) {
        const idx = englishWords.indexOf(word);
        englishWords.splice(idx, 1);
    }

    // add words
    let includes = [
        "ONS",
        "GAMEPLAY",
        "QUICKSAVE",
        "AUTOSAVE",
        "EXITSAVE",
        "CARBONDIOXIDE",
        "THROWABLES",
        "CHARGEN",
        "DERMAESTHETIC",
        "DIGIPICKS",
        "STARMAP",
        "STIMPAK",
        "SYRINGER",
        "UNASSIGN",
        "UNCATEGORIZED",
        "UNDOCK",
        "UNEQUIP",
        "UNSELECT",
        "RADAWAY",
        "CATALOGUE",
    ];
    includes.forEach((s, i) => (includes[i] = s.toLowerCase()));
    englishWords = englishWords.concat(includes);
}

let file = fs.readFileSync("./data/translate_en.txt", { encoding: "utf16le" });
let lines = file.split("\r\n");
let new_lines = [];

for (const line of lines) {
    // extract the tranlated string
    const seprator_idx = line.indexOf("\t");
    const msgid = line.slice(0, seprator_idx);
    const msgstr = line.slice(seprator_idx + 1);

    // skip mix casing
    if (msgstr.endsWith(".") || msgstr != msgstr.toUpperCase() && msgstr != msgstr.toLowerCase()) {
        new_lines.push(line);
        continue;
    }

    // parse msgstr
    let idx = 0;
    let wasletter = false;
    let word = "";
    let idx_b = 0;
    let idx_e = 0;
    let words = [];
    for (const char of msgstr) {
        if (char.toLowerCase() != char.toUpperCase()) {
            if (!wasletter) {
                idx_b = idx;
                word += char;
                wasletter = true;
            } else {
                word += char;
            }
        } else {
            if (wasletter) {
                idx_e = idx - 1;
                words.push({
                    word,
                    idx_b,
                    idx_e,
                });

                wasletter = false;
                word = "";
                idx_b = 0;
                idx_e = 0;
            }
        }

        ++idx;
    }

    if (wasletter) {
        idx_e = idx - 1;
        words.push({
            word,
            idx_b,
            idx_e,
        });
    }

    // got a list of words, now match word_list
    for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];

        // ignore single letter
        if (word.word.length == 1) words.splice(i, 1);

        // ignore words not in the word_list
        if (englishWords.indexOf(word.word.toLowerCase()) == -1) words.splice(i, 1);
    }

    // got a list of words to capitalize
    for (const word of words) {
        word.word = word.word[0].toUpperCase() + word.word.substring(1).toLowerCase();
    }

    // modify msgstr
    let new_msgstr = msgstr;
    for (const word of words) {
        new_msgstr = new_msgstr.substring(0, word.idx_b) + word.word + new_msgstr.substring(word.idx_e + 1);
    }

    new_lines.push(msgid + "\t" + new_msgstr);
}

const output_path = "./output/Data/interface/";

fs.rmSync("./output", { recursive: true, force: true });
fs.mkdirSync(output_path, { recursive: true });

fs.writeFileSync(output_path + "translate_en.txt", new_lines.join("\n"), { encoding: "utf16le" });
fs.cpSync("./data/fontconfig_en.txt", output_path + "fontconfig_en.txt");

child_process.execSync("tar -c -a -v -C ./output -f output/STARFIELD_NOCAPS.zip Data");

console.log("Done!");
