// _____________________________________________________
// results.js
// 実行ログを垂れ流す部分の実装

const $ = require('jquery');


// _____________________________________________________
// manipulate

export function clearResults() {
    $('#div_resultlogs').empty();
}

export function appendResult(title, message, classtype, isProgressing = false) {
    if ($('#div_resultlogs > div').first().data('isprog')) {
        $('#div_resultlogs > div').first().remove();
    }
    const titledom =
        $('<div></div>').text(title).addClass('alert-' + classtype + ' title');
    const bodydom = $('<div></div>').addClass('body').addClass('d-none');

    if (typeof message === 'object') {
        for (const key in message) {
            const msg = '' + message[key];
            if (msg.match(/\n/)) {
                const keydom1 = $('<span></span>').text(key);
                const keydom2 = $('<button></button>')
                    .text('[copy]')
                    .css('font-size', 'small')
                    .addClass('btn btn-sm btn-primary');
                const valdom = $('<pre></pre>')
                    .addClass('val')
                    .text(message[key])
                    .data('key', key);
                bindToggler('click', keydom1, valdom);
                bindCopyButton('click', keydom2, valdom);
                const keydom =
                    $('<div></div>').addClass('key').append(keydom1).append(keydom2);
                bodydom.append(keydom).append(valdom);
                bodydom.append(keydom).append(valdom);
            } else {
                bodydom.prepend($('<div></div>')
                    .addClass('keypair')
                    .append($('<div></div>').addClass('key').text(key))
                    .append($('<div></div>')
                        .addClass('val')
                        .text(msg)
                        .data('key', key)));
            }
        }
    } else {
        bodydom.append($('<pre></pre>').text(message));
    }
    bindToggler('click', titledom, bodydom);
    $('#div_resultlogs')
        .prepend($('<div></div>')
            .addClass('resultLog')
            .data('isprog', isProgressing)
            .append(titledom)
            .append(bodydom));
}


// _____________________________________________________
// (internal)


/**
 * buttondom を event すると class をトグルする
 * @param {string} event
 * @param {JQuery} buttondom
 * @param {JQuery} hiddendom
 */
function bindToggler(
    event, buttondom, hiddendom, buttondomClass = '',
    hiddendomClass = 'd-none') {
    buttondom.on(event, { fr: buttondom, to: hiddendom }, (e) => {
        $(e.data.fr).toggleClass(buttondomClass);
        $(e.data.to).toggleClass(hiddendomClass);
    });
}


function bindCopyButton(event, buttondom, textdom) {
    buttondom.on(event, { tg: textdom }, (e) => {
        copyTextToClipboard($(e.data.tg).text());
    });
}

function copyTextToClipboard(text) {
    let tempdom = $('#__clipboard');
    if (tempdom.length == 0)
        tempdom = $('<textarea id=\'__clipboard\'></textarea>').appendTo($('body'));
    tempdom.val(text).css('display', 'inline');
    copyDomToClipboard(tempdom);
    tempdom.val('').css('display', 'none');
}

function copyDomToClipboard(dom) {
    dom.select();
    document.execCommand('copy');
}