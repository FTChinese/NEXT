/* exported convertChinese*/

function identifyLanguage(language){//TO Identify language which need to use the function to translate.
    if (!language || ['zh-TW', 'zh-HK', 'zh-MO', 'zh-MY', 'zh-SG'].indexOf(language) === -1) {
        return false;
    }
    return true;
}

function containsChinese(str) {
    return /[\u4E00-\u9FFF]/.test(str);
}

function fixQuotes(text) {
    // Replace any traditional Chinese quote (single or double) with an English single quote
    // This regex matches any of the four traditional Chinese quote characters
    // MARK: - If it is a JSON string, fixing quotes might corrupt the JSON structure
    if (/^[\[\{]/.test(text)) {return text;}
    return text
        .replace(/(^|[^\u4e00-\u9fff])[『』]([^\u4e00-\u9fff]|$)/g, `$1'$2`)
        .replace(/(^|[^\u4e00-\u9fff])[「」]([^\u4e00-\u9fff]|$)/g, `$1"$2`);
}

async function convertChinese(text, language) {

    async function fetchDictJSON(url) {
        const dictLocation = (window.isFrontendTest && !window.isPowerTranslate) ? './scripts' : '/powertranslate/scripts';
        const response = await fetch(`${dictLocation}/${url}`);
        return response.json();
    }

    function mergeJSONObjects(mergedObj, obj2) {
        for (let key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (mergedObj.hasOwnProperty(key) && typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
            mergedObj[key] = mergeJSONObjects(mergedObj[key], obj2[key]);
            } else {
            mergedObj[key] = obj2[key];
            }
        }
        }
        return mergedObj;
    }

    async function getDictionary(language){
        let content = {
        'zh-TW':['big5.json','tw.json','tw-names.json'], 
        'zh-HK':['big5.json','hk.json','hk-names.json'],
        'zh-MO':['big5.json','mo.json','mo-names.json'], 
        'zh-MY':['my.json','my-names.json'],
        'zh-SG':['sg.json','sg-names.json']
        };
        try {
            let dictionary_list = content[language];
            let fetchPromises = dictionary_list.map(fetchDictJSON);
            let fetchedDataArray = await Promise.all(fetchPromises);
            let mergedDictionary = {};
            fetchedDataArray.forEach(item => {
                mergedDictionary = mergeJSONObjects(mergedDictionary, item);
            });
            return mergedDictionary;
        } catch(err) {
            console.error(`Error reading or parsing JSON data: ${err}`);
        }
    }

    async function convert(language, text) {
        try {
            if (window.trie === undefined) {
            window.trie = new Trie();
            }
            if (window.trieLangauge !== language) {
            let dic = await getDictionary(language);
            window.trie.load(dic);
            window.trieLangauge = language;
            }
            let currentIndex = 0;
            let replacedText = '';
            while (currentIndex < text.length) {
            const result = window.trie.findMaxMatch(text, currentIndex);
            if (result && result.to) {
                replacedText += result.to;
                currentIndex = result.index + 1;
            } else {
                replacedText += text[currentIndex];
                currentIndex++;
            }
            }
            return fixQuotes(replacedText);
        } catch (error) {
            console.error(`Error reading or parsing JSON data: ${error}`);
        }
        return text;
    }

    if (!identifyLanguage(language)){
        return text;
    }
    if (!containsChinese(text)) {
        return text;
    }
    // MARK: get the urls from language
    // console.log(`converting: \n${text} to ${language}`);
    const newText = await convert(language, text);
    return newText;
}
