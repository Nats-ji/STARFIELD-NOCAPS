# STARFIELD-NOCAPS

A crude script to convert all uppercase words in the UI of Starfield to capital case.

Released at https://www.nexusmods.com/starfield/mods/1246/

## Usage
Put the extracted `translate_en.txt` inside `./data`, then run:
```sh
npm install
npm run build
```

You also need to change `$MAIN_Font` and `$MAIN_Font_Bold` inside `fontcnnfig_en.txt`, because the default main font only have capital letters.


## Localization
If you want to generate localization for other languages, you need to make some tweaks inside `./src/main.js`, i'm not sure it will work out of box. 

There are some problems you need to solve to use it on other languages:

1. Does the built-in case conversion function in nodejs work for non-english letters?
2. I used a npm package called [`wordlist-english`](https://www.npmjs.com/package/wordlist-english) to decide when to capitalize a word, so it won't change cases for acronyms. You need something equivlent in your language, or you will need to manually exclude the acronyms.
3. There are some words doesn't exist in `wordlist-english`, i had to manually include [them](https://github.com/Nats-ji/STARFIELD-NOCAPS/blob/master/src/main.js#L17-L36).  


![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112916-1463291115.png)
![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112889-438038306.png)

![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112910-1267348542.png)
![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112897-290197854.png)

![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112910-2097748195.png)
![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112891-234280736.png)

![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112916-617947436.png)
![](https://staticdelivery.nexusmods.com/mods/4187/images/1246/1246-1694112895-2005422366.png)
