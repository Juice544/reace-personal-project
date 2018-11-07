import React, { Component } from 'react';

import Styles from './styles.m.css';
import Checkbox from '../../theme/assets/Checkbox';
import { api } from '../../REST';
import { sortTasksByGroup, sortTasksByDate } from '../../instruments/helpers';

import Spinner from '../../components/Spinner';
import Task from '../../components/Task';

export default class Scheduler extends Component {
    state = {
        tasks:           [],
        newTaskMessage:  '',
        tasksFilter:     '',
        isTasksFetching: false,
    };

    componentDidMount () {
        this._fetchTasksAsync();
    }

    _fetchTasksAsync = async () => {
        try {
            this._setTasksFetchingState(true);
            const tasks = await api.fetchTasks();

            this.setState({
                tasks: sortTasksByGroup(tasks),
            });
        } catch ({ message }) {
            console.log(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _updateTasksFilter = (event) => {
        const { value } = event.target;

        this.setState({ tasksFilter: value.toLocaleLowerCase() });
    };

    _updateNewTaskMessage = (event) => {
        const { value: newTaskMessage } = event.target;

        this.setState({ newTaskMessage });
    };

    _getAllCompleted = () => {
        const { tasks } = this.state;

        return tasks.every((task) => {
            return task.completed === true;
        });

    };

    _setTasksFetchingState = (bool) => {
        this.setState({ isTasksFetching: bool });
    };

    _createTaskAsync = async (event) => {
        event.preventDefault();
        const { newTaskMessage } = this.state;

        if (newTaskMessage) {
            try {
                this._setTasksFetchingState(true);

                const task = await api.createTask(newTaskMessage);

                this.setState((prevState) => ({
                    tasks:          sortTasksByGroup([task, ...prevState.tasks]),
                    newTaskMessage: '',
                }));
            } catch ({ message }) {
                console.log(message);
            } finally {
                this._setTasksFetchingState(false);
            }
        }

        return null;
    };

    _updateTaskAsync = async (taskProps) => {
        const { tasks } = this.state;

        try {
            this._setTasksFetchingState(true);
            await api.updateTask(taskProps);

            const sortTask = sortTasksByGroup(tasks.map(
                (task) => task.id === taskProps.id ? taskProps : task
            ));

            this.setState({
                tasks: sortTask,
            });

        } catch ({ message }) {
            console.error(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _removeTaskAsync = async (id) => {
        try {
            this._setTasksFetchingState(true);
            await api.removeTask(id);

            await this.setState(({ tasks }) => ({
                tasks: tasks.filter(
                    (task) => task.id !== id
                ),
            }));
        } catch ({ message }) {
            console.error(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _completeAllTasksAsync = async () => {
        const notCompletedTasks = this.state.tasks.filter((task) => {
            return task.completed === false;
        });

        if (notCompletedTasks.length !== 0) {
            this._setTasksFetchingState(true);
            try {
                await api.completeAllTasks(notCompletedTasks.map((task) => {
                    task.completed = true;

                    return task;
                }));

                this.setState(({ tasks }) => ({
                    tasks: tasks.map((task) => {
                        task.completed = true;

                        return task;
                    }),
                }));

            } catch ({ message }) {
                console.log(message);
            } finally {
                this._setTasksFetchingState(false);
            }
        } else {
            return null;
        }
    };

    filterTask = (tasks, tasksFilter) => {
        return [...tasks.filter((task) => task.message.toLocaleLowerCase().indexOf(tasksFilter) !== -1)];
    }

    render () {
        const { isTasksFetching, tasks, tasksFilter, newTaskMessage } = this.state;

        const sortTasksItems = sortTasksByDate(this.filterTask(tasks, tasksFilter));

        const tasksItems = tasksFilter ? sortTasksItems : tasks;

        const renderTask = tasksItems.map((task) => (
            <Task
                _removeTaskAsync = { this._removeTaskAsync }
                _updateTaskAsync = { this._updateTaskAsync }
                completed = { task.completed }
                favorite = { task.favorite }
                id = { task.id }
                key = { task.id }
                message = { task.message }
            />
        ));

        return (
            <section className = { Styles.scheduler }>
                <main>
                    <Spinner isSpinning = { isTasksFetching } />
                    <header>
                        <h1 className = { Styles.test }>Планировщик задач</h1>
                        <input placeholder = 'Поиск' type = 'search' value = { this.state.tasksFilter } onChange = { this._updateTasksFilter } />
                    </header>
                    <section >
                        <form onSubmit = { this._createTaskAsync }>
                            <input
                                className = { Styles.createTask }
                                maxLength = { 50 }
                                placeholder = 'Описание моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                                onChange = { this._updateNewTaskMessage }
                            />
                            <button>
                                Добавить задачу
                            </button>
                        </form>
                        <div className = { Styles.overlay } >
                            <ul>
                                { renderTask }
                            </ul>
                        </div>
                    </section>
                    <footer>
                        <Checkbox
                            checked = { this._getAllCompleted() }
                            color1 = 'blue'
                            color2 = 'white'
                            height = { 25 }
                            width = { 25 }
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks } >
                          Все задачи выполнены
                        </span>
                    </footer>
                </main>
            </section>
        );
    }
}
