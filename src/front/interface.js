// _____________________________________________________
// interface.js
// bundle of interfaces

const $ = require('jquery');
export const Editor = require('./interface/aceditor');
export const LaunchPad = require('./interface/launchpad');
export const Stdios = require('./interface/stdios');
export const Results = require('./interface/results');
export const TaskSelector = require('./interface/taskselector');


// _____________________________________________________
// common setup

$(() => {
    $('textarea.enabletabs').keydown((e) => {
        if (e.keyCode === 9) {
            e.preventDefault(); // デフォルト動作の中止
            var elem = e.target;
            var val = elem.value;
            var pos = elem.selectionStart;
            elem.value = val.substr(0, pos) + '\t' + val.substr(pos, val.length);
            elem.setSelectionRange(pos + 1, pos + 1);
        }
    });
    bindEvents();
});


function bindEvents() {
    TaskSelector.addChangeEventListener(() => {
        const [cmd, lang] = TaskSelector.getSelectedTaskCmdLang();
        if (cmd === '') return;
        LaunchPad.changeVisibleRecipes(cmd);
        Editor.changeLanguage(lang);
    });
}

// _____________________________________________________
// 

export function gatherInfo() {
    const cmd = TaskSelector.getSelectedTaskCmd();
    const options = LaunchPad.getOptionValues(cmd);
    return {
        txt_stdins: Stdios.getStdins(true),
        txt_code: Editor.getValue(),
        cmd: cmd,
        options: options
    };
}

export const getSelectedTaskCmd = TaskSelector.getSelectedTaskCmd;

export function appendTasks(taskInfos) {
    for (let taskInfo of taskInfos) {
        TaskSelector.appendTask(taskInfo);
        LaunchPad.appendTask(taskInfo);
    }
    TaskSelector.pullSelectedTask();
}
