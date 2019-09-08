// _____________________________________________________
// interface.js
// bundle of interfaces

export const Editor = require('./interface/aceditor');
export const Panel = require('./interface/panel');
export const Stdios = require('./interface/stdios');
export const Results = require('./interface/results');
export const TaskSelector = require('./interface/taskselector');

export const getSelectedTask = TaskSelector.getSelectedTask;

export function appendTasks(taskInfos) {
    for (let taskInfo of taskInfos) {
        TaskSelector.appendTask(taskInfo);
        Panel.appendTask(taskInfo);
    }
    TaskSelector.pullSelectedTask();
}
