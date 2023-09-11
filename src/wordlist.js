import en_wordlist from "wordlist-english";

// excludes defines words not to convert from Caps
let excludes = {}

excludes.en = ['em', 'id']
excludes.de = []
excludes.es = []
excludes.fr = []
excludes.it = []
excludes.pl = []
excludes["pt-br"] = []

// includes defines extra words to convert from Caps

let includes = {}

includes.en = [
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
    "BETHESDA",
    "SHADERS",
    "DIGIPICK",
    "VECTERA",
    "QUICKSLOT",
    "FREESTAR",
    "OFFLINE",
    "HEADTRACKING",
    "ARGOS",
    "BOT",
];

includes.de = []
includes.es = []
includes.fr = []
includes.it = []
includes.pl = []
includes["pt-br"] = []

// prepare en includes
includes.en.forEach((s, i) => (includes.en[i] = s.toLocaleLowerCase('en')));
includes.en = includes.en.concat(en_wordlist["english"], en_wordlist["english/american"]);
includes.en = includes.en.filter((element) => excludes.en.indexOf(element) < 0);

export {excludes, includes}