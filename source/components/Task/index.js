// Core
import React, { PureComponent } from 'react';
import classNames from 'classnames';

// Instruments
import Styles from './styles.m.css';

// Components
import Checkbox from '../../theme/assets/Checkbox';
import Star from '../../theme/assets/Star';
import Edit from '../../theme/assets/Edit';
import Remove from '../../theme/assets/Remove';

export default class Task extends PureComponent {

    state = {
        isTaskEditing: false,
        newMessage:    this.props.message,
    };

    taskInput = React.createRef();

    _getTaskShape = ({
        id = this.props.id,
        completed = this.props.completed,
        favorite = this.props.favorite,
        message = this.props.message,
    }) => ({
        id,
        completed,
        favorite,
        message,
    });

    _updateTaskMessageOnClick = () => {
        const { isTaskEditing } = this.state;

        if (isTaskEditing) {
            this._updateTask();

            return null;
        }
        this._setTaskEditingState(true);
    };

    _cancelUpdatingTaskMessage = () => {
        const { message: newMessage } = this.props;

        this._setTaskEditingState(false);

        this.setState({
            newMessage,
        });
    };

    _setTaskEditingState = (isTaskEditing = true) => {
        this.taskInput.current.disabled = !isTaskEditing;

        if (isTaskEditing) {
            this.taskInput.current.focus();
        }

        this.setState({
            isTaskEditing,
        });
    };

    _updateNewTaskMessage = (event) => {
        const { value } = event.target;

        this.setState({ newMessage: value });
    };

    _updateTask = () => {
        const { message,
            _updateTaskAsync } = this.props;
        const { newMessage } = this.state;

        this._setTaskEditingState(false);

        if (message !== newMessage) {
            _updateTaskAsync(
                this._getTaskShape({
                    message: newMessage,
                })
            );
        }

        return null;
    };

    _updateTaskMessageOnKeyDown = (event) => {
        if (!this.state.newMessage) {
            return null;
        }
        if (event.key === "Enter") {
            this._updateTask();
        }
        if (event.key === "Escape") {
            this._cancelUpdatingTaskMessage();
        }
    };

    _toggleTaskCompletedState = () => {
        const { _updateTaskAsync, completed } = this.props;

        _updateTaskAsync(
            this._getTaskShape({ completed: !completed })
        );

    };

    _toggleTaskFavoriteState = () => {
        return this.props._updateTaskAsync(
            this._getTaskShape({ favorite: !this.props.favorite })
        );
    };

    _removeTask = () => {
        return this.props._removeTaskAsync(this.props.id);
    };

    render () {
        const { newMessage, isTaskEditing } = this.state;
        const { completed, favorite } = this.props;

        const style = classNames(Styles.task, {
            [Styles.completed]: completed,
        });

        return (
            <li className = { style }>
                <div className = { Styles.content }>
                    <Checkbox
                        checked = { completed }
                        className = { Styles.toggleTaskCompletedState }
                        color1 = 'blue'
                        color2 = 'white'
                        onClick = { this._toggleTaskCompletedState }
                    />
                    <input
                        disabled
                        maxLength = { 50 }
                        value = { newMessage }
                        ref = { this.taskInput }
                        type = 'text'
                        onChange = { this._updateNewTaskMessage }
                        onKeyDown = { this._updateTaskMessageOnKeyDown }
                    />
                </div>
                <div className = { Styles.actions }>
                    <Star
                        checked = { favorite }
                        className = { Styles.toggleTaskFavoriteState }
                        color1 = 'blue'
                        color2 = 'gray'
                        inlineBlock
                        onClick = { this._toggleTaskFavoriteState }
                    />
                    <Edit
                        checked = { isTaskEditing }
                        className = { Styles.updateTaskMessageOnClick }
                        color1 = 'blue'
                        color2 = 'gray'
                        inlineBlock
                        onClick = { this._updateTaskMessageOnClick }
                    />
                    <Remove
                        className = { Styles.removeTask }
                        color1 = 'blue'
                        color2 = 'gray'
                        inlineBlock
                        onClick = { this._removeTask }
                    />
                </div>
            </li>
        );
    }
}
