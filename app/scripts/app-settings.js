
delegate.on('click', '.settings-item', async function (event) {
    try {
        const sectionIndex = parseInt(this.getAttribute('data-section-index'), 10);
        const itemIndex = parseInt(this.getAttribute('data-item-index'), 10);

        // console.log(`sectionIndex: ${sectionIndex}, itemIndex: ${itemIndex}`, appTypeMap?.setting?.[sectionIndex]);

        const info = appTypeMap?.setting?.[sectionIndex]?.items?.[itemIndex];
        if (!info) {return;}
        console.log('info:', JSON.stringify(info));
        /*
        example data 1: 
info: {"id":"font-setting","headline":"字号设置","type":"setting","options":[{"name":"normal","display":"最小"},{"name":"normal","display":"较小"},{"name":"normal","display":"默认","is_default":true},{"name":"normal","display":"较大"},{"name":"normal","display":"最大"}],"cookieName":"fs"}
        example data 2: 
app-settings.js:11 info: {"id":"translation-preference","headline":"文章翻译偏好","type":"setting","options":[{"name":"both","display":"仅人工翻译"},{"name":"both","display":"机器翻译及人工翻译"}],"preferenceKey":"Article Translation Preference"}

        */
    } catch(err) {
        console.error(`render story error:`, err);
    }
});