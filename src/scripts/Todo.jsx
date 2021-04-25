import React, {Component, createRef} from 'react';
import Services from './services/config';

class Todo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            disabled: true,
            edited: 0
        }

        this.taskRef = createRef();
        this.updatedRef = createRef();

        this.createdTask = this.createdTask.bind(this);
        this.isFormValid = this.isFormValid.bind(this);
    }

    getTasks () {
        Services.get('/tasks')
            .then(response => {
                this.setState({tasks: response.data})
            })
    }

    createdTask (e) {
        const task = {
            status: 'progress',
            task: this.taskRef.current.value
        }
        Services.post('/tasks', task)
            .then(response => {
                this.setState({tasks: [...this.state.tasks, response.data], disabled: true});
            })
        e.preventDefault();
        e.target.reset();
    }

    deleteTask (id) {
        Services.delete(`/tasks/${id}`)
            .then(response => {
                if(response.status === 200) {
                    const tasks = this.state.tasks.filter(task => task.id !== id);

                    this.setState({tasks : tasks});
                }
            })
    }

    updatedTask (id, data) {
        Services.put(`/tasks/${id}`, data)
            .then(response => {

                const updateTask = this.state.tasks.map(task => task.id === response.data.id ? {...task, ...response.data} : task);

                this.setState({tasks : updateTask, edited: null});

            })
    }

    changedStatusTask (id) {

        const task = this.state.tasks.find(task => task.id === id )
        const update = {...task, status: 'terminated'};

        this.updatedTask(id, update);
    }

    changedTitleTask (task) {

        if(this.updatedRef.current.value !== '') {
            const updated = {...task, task: this.updatedRef.current.value }
            this.updatedTask(task.id, updated);
        }

    }

    editedTask(id) {
        this.setState({edited: id});
    }

    /* Validaciones */

    isFormValid (e) {
        if(e.target.value === '' || e.target.value === undefined) {
            this.setState({disabled: true})
        } else {
            this.setState({disabled: false})
        }
    }

    onKeyDown (e, key, fn) {
        if(e.key === key) fn();
    }

    /* end validaciones */

    componentDidMount() {
        this.getTasks();
    }

    render() {
        return (
            <div className="max-w-screen-xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 py-20 px-8">
                <div className="bg-gray-100 p-8 rounded-lg">
                    <h3 className="font-bold text-gray-700 text-lg leading-tight mb-4">Registrar Tarea:</h3>
                    <form onSubmit={ this.createdTask }>
                        <div className="space-y-6">
                            <label htmlFor="task">
                                <input type="text" name="task" placeholder="Agrega una tarea" ref={this.taskRef} onChange={this.isFormValid} id="task" className="rounded text-gray-500 text-sm border-0 w-full font-display focus:ring-0 focus:outline-none placeholder-gray-300"/>
                            </label>
                            <button
                                type="submit"
                                disabled={this.state.disabled}
                                className="bg-green-500 text-white rounded w-full py-4 leading-3 px-6 w-full text-center focus:outline-none disabled:bg-gray-300">
                                Registrar Tarea
                            </button>
                        </div>
                    </form>
                </div>
                <div className="p-8">
                    <h3 className="font-bold text-gray-700 text-lg leading-tight mb-4">Tareas:</h3>
                    <div className="divide-y divide-gray-100">

                        {
                            this.state.tasks.length > 0
                                ? this.state.tasks.map((task, index) =>
                                    (
                                        <div className="flex items-center space-x-2 py-2" key={task.id}>
                                            <div className="flex-shrink-0 text-center">{index + 1 <= 9 ? `0${index + 1}` : index + 1}</div>
                                            {
                                                this.state.edited === task.id
                                                    ? <div className="flex-grow items-center flex bg-gray-100 rounded">
                                                        <input type="text" ref={this.updatedRef} defaultValue={task.task} autoFocus onKeyDown={ (e) => this.onKeyDown(e, 'Enter', ()=> this.changedTitleTask(task)) }  className="text-sm leading-relaxed text-gray-500 rounded-l bg-gray-100 border-0 flex-grow focus:ring-0" />
                                                    </div>
                                                    : <>
                                                        <div className="flex-grow text-sm leading-relaxed text-gray-500">{task.task}</div>
                                                        <div className="flex-shrink-0">
                                                            {
                                                                task.status === 'progress'
                                                                    ? <span className="leading-4 px-2 text-xs rounded-lg bg-yellow-500 text-white">In Progress</span>
                                                                    : <span className="leading-4 px-2 text-xs rounded-lg bg-green-500 text-white">Terminated</span>
                                                            }
                                                        </div>
                                                        <div className="flex-shrink-0 flex items-center justify-center">
                                                            <button type="button" onClick={ () => this.editedTask(task.id)} disabled={task.status === 'terminated'} className="w-8 h-8 rounded-full flex items-center justify-center border-0 text-indigo-400 focus:outline-none disabled:text-gray-300 disabled:cursor-default">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button type="button" onClick={ () => this.changedStatusTask(task.id) } disabled={task.status === 'terminated'} className="w-8 h-8 rounded-full flex items-center justify-center border-0 text-green-400 focus:outline-none disabled:text-gray-300 disabled:cursor-default">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                            <button type="button" onClick={ () => this.deleteTask(task.id) } className="w-8 h-8 rounded-full flex items-center justify-center border-0 text-red-300 focus:outline-none">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </>
                                            }
                                        </div>
                                    )
                                )
                                : <div>No hay tareas</div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Todo;