// //src/app/components/TaskList.tsx
// 'use client';
//
// import { useState, useTransition } from 'react';
// import { deleteTask } from '../actions/taskActions';
// import toast from 'react-hot-toast';
//
// type Task = {
//     _id: string;
//     task: string;
// };
//
// export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
//     const [tasks, setTasks] = useState<Task[]>(initialTasks);
//     const [isPending, startTransition] = useTransition();
//
//     const handleDelete = (id: string) => {
//         // Optimistically update the UI
//         setTasks((prev) => prev.filter((task) => task._id !== id));
//
//         startTransition(() => {
//             deleteTask(id).catch((error) => {
//                 toast.error('Failed to delete task');
//                 console.error(error);
//             });
//         });
//     };
//
//     return (
//         <ul className="space-y-2">
//             {tasks.map((task) => (
//                 <li key={task._id} className="flex justify-between">
//                     <span>{task.task}</span>
//                     <button
//                         onClick={() => handleDelete(task._id)}
//                         className="text-red-600 hover:text-red-800"
//                     >
//                         ❌
//                     </button>
//                 </li>
//             ))}
//         </ul>
//     );
// }
