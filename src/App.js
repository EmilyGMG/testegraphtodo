import { useEffect, useMemo, useState } from "react";

import { Form } from './components/Form';
import { Input } from "./components/Input";
import { Tasks } from './components/Tasks';

import styles from './styles/app.module.css';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const LOCALSTORAGE_TASKS_KEY = 'todolist-tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTaskName, setSearchTaskName] = useState('')

  const onAddTask = (newTask) => {
    setTasks(currentState => [...currentState, newTask])
    setSearchTaskName('')
  }

  const onRemoveTask = (taskId) => {
    setTasks(currentState => currentState.filter(task => task.id !== taskId))
  }

  const onChangeCompleted = (taskId) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId)

    const updatedTask = [...tasks]
    updatedTask[taskIndex].completed = !updatedTask[taskIndex].completed

    setTasks(updatedTask)
  }

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCALSTORAGE_TASKS_KEY, JSON.stringify(tasks))
    }
  }, [tasks])

  useEffect(() => {
    const tasksLocal = localStorage.getItem(LOCALSTORAGE_TASKS_KEY)
    tasksLocal && setTasks(JSON.parse(tasksLocal))
    setIsLoading(false)
  }, [])

  const handleTermSearch = (e) => {
    const valueTerm = e.target.value.toLocaleLowerCase()
    setSearchTaskName(valueTerm)
  }

  const totalTasks = useMemo(() => {
    return tasks.length
  }, [tasks])

  const totalCompletedTasks = useMemo(() => {
    return tasks.filter(task => task.completed).length
  })

  /*GRAPH*/
  const data = {
    labels: ['Concluidas', 'Total'],
    datasets: [
      {
        label: '# of Votes',
        data: [totalCompletedTasks, totalTasks],
        backgroundColor: ['#2F5CC6', '#F89C3A'],
        borderWidth: 1,
      },
    ],
  };
  const formated =  totalTasks === totalCompletedTasks ? 0 : Number(totalTasks) / Number(totalCompletedTasks) >= 1000 ? 0 : Math.round(Number(totalTasks) / Number(totalCompletedTasks))
  ;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Lista</h1>

        <Form onSubmit={onAddTask} />

        <hr />

        <Input
          type="text"
          value={searchTaskName}
          onChange={handleTermSearch}
          placeholder="Pesquisar uma tarefa"
        />

        <Tasks
          tasks={tasks}
          searchTaskName={searchTaskName}
          onRemoveTask={onRemoveTask}
          onChangeCompletedTask={onChangeCompleted}
        />

        <footer className={styles.footer}>
          <h6>
            Total de tarefas:
            <span>{totalTasks}</span>
          </h6>

          <h6>
            Total de tarefas concluidas:
            <span>{totalCompletedTasks}</span>
          </h6>
        </footer>
        {totalTasks > 0 &&
          <div>
            <div className={styles.graph}>
              <Doughnut data={data} />
            </div>
            <p className={styles.percentText}>
              {formated}%
            </p>
          </div>
        }
      </div>

    </div>
  )
}