/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-11-14 12:02:16
 * @FilePath     : /index.js
 * @LastEditTime : 2024-07-02 20:26:08
 * @Description  : A minimal plugin for SiYuan, relies only on nothing but pure index.js.
 *                 Refer to https://docs.siyuan-note.club/zh-Hans/guide/plugin/five-minutes-quick-start.html
 */
// index.js
const siyuan = require('siyuan');

const processors = {
    bilibili: (detail) => {
        const pat = /^((?:【.+】\s*)+)\s*(https:\/\/www\.bilibili\.com.+)$/
        const match = detail.textPlain.match(pat);
        if (!match) return false;
        let title = match[1];
        let link = match[2];
        detail.resolve({
            textPlain: `[${title}](${link})`,
            textHTML: undefined,
            files: detail.files,
            siyuanHTML: detail.siyuanHTML
        });
        return true;
    },
    url: (detail) => {
        const pat = /^(https?:\/\/\S+)$/;
        const match = detail.textPlain.match(pat);
        if (!match) return false;
        let link = match[1];
        detail.resolve({
            textPlain: `[${link}](${link})`,
            textHTML: undefined,
            files: detail.files,
            siyuanHTML: detail.siyuanHTML
        });
        return true;
    },
    zotero: (detail) => {
        let textPlain = detail.textPlain;
        //处理 Zotero 的粘贴
        const zoteroPat = /^“(?<title>.+?)”\s*\(\[(?<itemName>.+?)\]\((?<itemLink>zotero:.+?)\)\)\s*\(\[pdf\]\((?<annoLink>zotero:.+?)\)\)(.*?)$/
        const ans = textPlain.match(zoteroPat);
        if (!ans) return false;
        let title = ans.groups.title;
        let itemName = ans.groups.itemName;
        // let itemLink = ans.groups.itemLink;
        let annoLink = ans.groups.annoLink;
        const txt = `“${title}”([${itemName}](${annoLink}))`;
        console.debug("Paste zotero link:", txt);
        detail.resolve({
            textPlain: txt, textHTML: "<!--StartFragment--><!--EndFragment-->",
            files: detail.files, siyuanHTML: detail.siyuanHTML
        });
        return true;
    }
};

const onPaste = async (event) => {
    const detail = event.detail;
    for (const key in processors) {
        if (processors[key](detail) === false) continue;
        console.debug(`Paste processor ${key} matched`);
        return;
    }
}

module.exports = class SimplePastePlugin extends siyuan.Plugin {

    config = {};

    async onload() {
        this.eventBus.on('paste', onPaste);
    }

    onunload() {
        this.eventBus.off('paste', onPaste);
    }

}
