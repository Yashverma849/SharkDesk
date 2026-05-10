import { User, Calendar, Flag } from "lucide-react"

export type Task = {
  id: string | number
  name: string
  assignee?: string
  dueDate: string
  priority: string
  status: string
  project?: string
}

interface TaskTableProps {
  tasks: Task[]
  showAssignee?: boolean
}

export function TaskTable({ tasks, showAssignee = true }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-[#E5E7EB] font-medium mb-1">No tasks in this project</h3>
        <p className="text-[#9CA3AF] text-sm">Create or assign tasks to get started</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-[#14B8A6]'
      case 'Done': return 'text-emerald-500/70'
      default: return 'text-[#9CA3AF]' // Todo
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-400'
      case 'Medium': return 'text-amber-400'
      default: return 'text-[#9CA3AF]' // Low
    }
  }

  return (
    <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#121826] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Task Name</th>
              {showAssignee && <th className="px-4 py-3 font-medium text-[#9CA3AF]">Assigned To</th>}
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Due Date</th>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Priority</th>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {tasks.map((task) => (
              <tr key={task.id} className="h-12 hover:bg-[#1F2937] transition-colors cursor-pointer group">
                <td className="px-4 text-[#E5E7EB] font-medium">{task.name}</td>
                {showAssignee && (
                  <td className="px-4 text-[#9CA3AF]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#0B0F1A] border border-[#1F2937] flex items-center justify-center">
                        <User className="w-3 h-3 text-[#9CA3AF]" />
                      </div>
                      {task.assignee || 'Unassigned'}
                    </div>
                  </td>
                )}
                <td className="px-4 text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {task.dueDate}
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-3.5 h-3.5 ${getPriorityColor(task.priority)}`} />
                    <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className={`font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
