// _____________________________________________________
// indicator.js
// ステータスの表示

const $ = require('jquery');

const States = {
    connection: {
        undefined: {
            color: 'dark',
            text: '...'
        },
        disconnected: {
            color: 'danger',
            text: 'disconnected'
        },
        connected: {
            color: 'success',
            text: 'connected'
        }
    }
};

const createdDoms = {};
const setted = {};

// _____________________________________________________
// initialize

$(() => {
    const pdom = $('#indicators');
    for (const i in States) {
        const s = States[i][setted[i]];
        createdDoms[i] = $('<li></li>')
            .css('display', 'inline-block')
            .addClass('badge')
            .addClass('badge-' + s.color)
            .text(s.text)
            .appendTo(pdom);
    }
});


// _____________________________________________________
// manipulate

export function setState(badge, state) {
    if (!States[badge] || !States[badge][state]) {
        console.error('Interface.Indicator.setState unknown pair (' + badge + ', ' + state + ')');
    }
    if (createdDoms[badge]) {
        const s = States[badge][state];
        createdDoms[badge]
            .removeClass('badge-' + States[badge][setted[badge]].color)
            .addClass('badge-' + s.color)
            .text(s.text);
    }
    setted[badge] = state;
}