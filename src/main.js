import { assert } from "console";
import * as wordlist from "./wordlist.js";
import * as fs from "fs";
import * as child_process from "child_process";

// load en file

// iterate lines and parse msgid and msgstr

// split msgstr by word

// exclude words length == 1

// if msgstr all cap, process all
// if msgstr non cap, process all
// if msgstr mix case or ends with ".", process only word with all cap

// if en, ignore words not in includes
// if other, ignore words in (excludes - includes)

// save a list of not converted words in en -> excludes for other lang
// save line numbers for not converted single word msgstr in en -> excludes for other lang

let CurrentLang = "en";
const AcronymList = new Set();
const ExcludeLines = [];

class Word {
    /**
     * @param {string} word
     * @param {number} idx_begin
     * @param {number} idx_end
     */
    constructor(word, idx_begin, idx_end) {
        this.buffer = word;
        this.idx_begin = idx_begin;
        this.idx_end = idx_end;
    }
}

/**
 * @param {string} lang
 * @returns {string}
 */
function load_tranlate_file(lang) {
    lang = lang.replace("-", "");
    let buffer = fs.readFileSync(`./data/translate_${lang}.txt`, { encoding: "utf16le" });
    assert(buffer, `failed to read language file for ${lang}.`);
    return buffer;
}

/**
 * @param {string} lang
 * @param {string} buffer
 */
function generate_translate_file(lang, buffer) {
    lang = lang.replace("-", "");
    fs.writeFileSync(`./output/Data/interface/translate_${lang}.txt`, buffer, { encoding: "utf16le" });
}

/**
 * @param {string} buffer
 * @returns {string[]}
 */
function parse_lines(buffer) {
    return buffer.split("\r\n");
}

/**
 * @param {string} line
 * @returns {[string, string]}
 */
function parse_msg_pair(line) {
    const seprator_idx = line.indexOf("\t");
    const msgid = line.slice(0, seprator_idx);
    const msgstr = line.slice(seprator_idx + 1);
    return [msgid, msgstr];
}

/**
 * @param {string} msgstr
 * @returns {Word[]}
 */
function parse_msgstr(msgstr) {
    let was_letter = false;
    let idx = 0;
    let idx_b = 0;
    let idx_e = 0;
    let word = "";
    /** @type {Word[]} */
    let words = [];
    for (const char of msgstr) {
        if (char.toLocaleLowerCase(CurrentLang) != char.toLocaleUpperCase(CurrentLang)) {
            // current char is a letter
            if (!was_letter) {
                idx_b = idx;
                word += char;
                was_letter = true;
            } else {
                word += char;
            }
        } else {
            if (was_letter) {
                idx_e = idx - 1;
                words.push(new Word(word, idx_b, idx_e));

                was_letter = false;
                word = "";
                idx_b = 0;
                idx_e = 0;
            }
        }

        ++idx;
    }

    if (was_letter) {
        idx_e = idx - 1;
        words.push(new Word(word, idx_b, idx_e));
    }

    return words;
}

/**
 * @param {string} word
 * @returns {string}
 */
function to_capitalcase(word) {
    return word[0].toLocaleUpperCase(CurrentLang) + word.substring(1).toLocaleLowerCase(CurrentLang);
}

/**
 * @param {string} msgstr
 * @returns {'mix' | 'lower' | 'upper'}
 */
function get_msgstr_casing(msgstr) {
    if (msgstr.endsWith(".") || (msgstr != msgstr.toLocaleUpperCase(CurrentLang) && msgstr != msgstr.toLocaleLowerCase(CurrentLang))) return "mix";
    if (msgstr == msgstr.toLocaleLowerCase(CurrentLang)) return "lower";
    else return "upper";
}

/**
 * @param {string} str
 * @param {Word} word
 */
function replace_string(str, word) {
    return str.substring(0, word.idx_begin) + to_capitalcase(word.buffer) + str.substring(word.idx_end + 1);
}

/**
 * @param {string[]} excludes
 * @param {string[]} includes
 * @returns {string[]}
 */
function build_exclude_list(excludes, includes) {
    let list = [];
    list = list.concat(excludes, Array.from(AcronymList));
    list = list.filter((element) => includes.indexOf(element) < 0);
    return list;
}

/**
 * @param {string} msgstr
 * @param {number} line_idx 
 */
function convert_msgstr(msgstr, line_idx) {
    const casing = get_msgstr_casing(msgstr);
    const words = parse_msgstr(msgstr);

    // single word
    let single_word = false
    if (words.length == 1) single_word = true

    // clean up words, use include and exclude
    for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];

        // remove single letter words
        if (word.buffer.length == 1) {
            words.splice(i, 1);
            continue;
        }

        // remove words that are not full CAPS in mixed-casing msgstrs
        if (casing == "mix" && word.buffer.toLocaleUpperCase(CurrentLang) != word.buffer) {
            words.splice(i, 1);
            continue;
        }

        if (CurrentLang == "en") {
            // en: remove words not in the word_list
            if (wordlist.includes.en.indexOf(word.buffer.toLocaleLowerCase(CurrentLang)) == -1) {
                // add to acronym list
                AcronymList.add(word.buffer.toLocaleLowerCase(CurrentLang));

                // single word add to exclude lines
                if (single_word)
                    ExcludeLines.push(line_idx);

                // remve from word list
                words.splice(i, 1);
            }
        } else {
            // other lang: remove words in exclude list
            let excludes = build_exclude_list(wordlist.excludes[CurrentLang], wordlist.includes[CurrentLang]);
            if (excludes.indexOf(word.buffer.toLocaleLowerCase(CurrentLang)) != -1) {
                words.splice(i, 1);
            }
        }
    }

    for (const word of words) {
        msgstr = replace_string(msgstr, word);
    }

    return msgstr;
}

function main() {
    const langs = ["en", "de", "es", "fr", "it", "pl", "pt-br"];

    //clean up output dir
    fs.rmSync("./output", { recursive: true, force: true });
    fs.mkdirSync("./output/Data/interface", { recursive: true });

    for (const lang of langs) {
        CurrentLang = lang;
        let buffer = load_tranlate_file(lang);
        let lines = parse_lines(buffer);
        let new_lines = [];
        for (let line_idx = 0; line_idx < lines.length; line_idx++) {
            const line = lines[line_idx];
            let [msgid, msgstr] = parse_msg_pair(line);
            if (lang == "en" || ExcludeLines.indexOf(line_idx) == -1) {
                msgstr = convert_msgstr(msgstr, line_idx);
            }
            new_lines.push(msgid + "\t" + msgstr);
        }
        generate_translate_file(lang, new_lines.join("\n"));
        fs.cpSync(`./data/fontconfig_${lang.replace('-','')}.txt`, `./output/Data/interface/fontconfig_${lang.replace('-','')}.txt`);
    }

    child_process.execSync("tar -c -a -v -C ./output -f output/STARFIELD_NOCAPS.zip Data");

    console.log("Done!")
}

main();
