import { TaskTable, Task } from "./TaskTable"

interface GroupedTaskListProps {
  tasks: Task[]
}

export function GroupedTaskList({ tasks }: GroupedTaskListProps) {
  // Group by project
  const grouped = tasks.reduce((acc, task) => {
    const project = task.project || "Uncategorized"
    if (!acc[project]) acc[project] = []
    acc[project].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const projects = Object.keys(grouped)

  if (projects.length === 0) {
    return (
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-[#E5E7EB] font-medium mb-1">No tasks assigned</h3>
        <p className="text-[#9CA3AF] text-sm">You have no tasks assigned to you right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {projects.map(project => (
        <div key={project} className="animate-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-[#E5E7EB] font-semibold text-lg mb-2">{project}</h2>
          <div className="h-px bg-[#1F2937] w-full mb-4"></div>
          <TaskTable tasks={grouped[project]} showAssignee={false} />
        </div>
      ))}
    </div>
  )
}
