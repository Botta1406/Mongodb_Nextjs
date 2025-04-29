// //src/app/components/TaskForm.tsx
// 'use client';
//
// import { useRef, useTransition } from 'react';
// import { addTask } from '../actions/taskActions';
// import toast from 'react-hot-toast';
//
// export default function TaskForm() {
//     const formRef = useRef<HTMLFormElement>(null);
//     const [isPending, startTransition] = useTransition();
//
//     const handleSubmit = (formData: FormData) => {
//         startTransition(async () => {
//             try {
//                 await addTask(formData);
//                 formRef.current?.reset();
//                 toast.success('Task added!');
//             } catch {
//                 toast.error('Failed to add task');
//             }
//         });
//     };
//
//     return (
//         <form ref={formRef} action={handleSubmit} className="mb-4 flex gap-2">
//             <input
//                 name="task"
//                 type="text"
//                 placeholder="Enter a task"
//                 required
//                 className="border px-2 py-1 rounded w-full"
//             />
//             <button
//                 type="submit"
//                 disabled={isPending}
//                 className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//             >
//                 {isPending ? 'Adding...' : 'Add'}
//             </button>
//         </form>
//     );
// }
