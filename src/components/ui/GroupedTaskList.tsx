"use client";

import { useState } from "react";
import { ChevronDown, Folder } from "lucide-react";
import { TaskTable, Task } from "./TaskTable";
import { cn } from "@/lib/utils";

interface GroupedTaskListProps {
  tasks: Task[]
}

export function GroupedTaskList({ tasks }: GroupedTaskListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Group by project
  const grouped = tasks.reduce((acc, task) => {
    const project = task.project || "Uncategorized";
    if (!acc[project]) acc[project] = [];
    acc[project].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const projects = Object.keys(grouped);

  if (projects.length === 0) {
    return (
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-[#E5E7EB] font-medium mb-1">No tasks assigned</h3>
        <p className="text-[#9CA3AF] text-sm">
          You have no tasks assigned to you right now.
        </p>
      </div>
    );
  }

  const toggleProject = (project: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [project]: !prev[project],
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-min transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]">
      {projects.map((project) => {
        const isExpanded = expandedProjects[project];
        const taskCount = grouped[project].length;

        return (
          <div
            key={project}
            style={{ order: isExpanded ? 2 : 1 }}
            className={cn(
              "group relative flex flex-col rounded-2xl border transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
              isExpanded 
                ? "col-span-full bg-[#121826] border-[#14B8A6] shadow-[0_0_40px_rgba(20,184,166,0.1)] mt-4 h-auto" 
                : "col-span-1 aspect-square bg-[#121826] border-[#1F2937] hover:border-[#14B8A6]/40 shadow-sm"
            )}
          >
            {/* Clickable Area (Square or Top of Rectangle) */}
            <button
              type="button"
              onClick={() => toggleProject(project)}
              className={cn(
                "flex transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isExpanded 
                  ? "flex-row items-center justify-between p-4 sm:px-8 sm:py-6 h-auto bg-[#14B8A6]/5" 
                  : "flex-col items-center justify-center p-5 text-center h-full hover:bg-[#1a2235]"
              )}
            >
              <div className={cn(
                "flex items-center gap-3 sm:gap-4 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                !isExpanded && "flex-col gap-2"
              )}>
                <div className={cn(
                  "flex items-center justify-center rounded-xl border transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-lg shrink-0",
                  isExpanded 
                    ? "h-10 w-10 sm:h-12 sm:w-12 bg-[#14B8A6] border-[#14B8A6] text-[#0B0F1A]" 
                    : "h-14 w-14 bg-[#0B0F1A] border-[#1F2937] text-[#14B8A6] group-hover:scale-105"
                )}>
                  <Folder className={cn("transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]", isExpanded ? "size-6" : "size-7")} />
                </div>
                
                <div className={cn(
                  "space-y-0.5 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  !isExpanded && "text-center"
                )}>
                  <h2 className={cn(
                    "font-bold tracking-tight transition-colors duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isExpanded ? "text-[#14B8A6] text-lg sm:text-xl truncate" : "text-[#E5E7EB] text-xs sm:text-sm line-clamp-2"
                  )}>
                    {project}
                  </h2>
                  <div className={cn(
                    "flex items-center gap-1.5 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    !isExpanded && "justify-center"
                  )}>
                    <span className="flex h-1 w-1 rounded-full bg-[#14B8A6] opacity-60" />
                    <p className="text-[9px] uppercase tracking-widest text-[#9CA3AF] font-bold">
                      {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicator / Arrow */}
              <div className={cn(
                "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isExpanded 
                  ? "bg-[#14B8A6] border-[#14B8A6] text-[#0B0F1A] rotate-180" 
                  : "mt-4 bg-[#0B0F1A] border-[#1F2937] text-[#9CA3AF] opacity-0 group-hover:opacity-100"
              )}>
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </button>

            {/* Expanding Table Content */}
            <div
              className={cn(
                "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
                isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-t border-[#1F2937]/50 p-6 pt-2">
                <div className="animate-in fade-in slide-in-from-top-6 duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  <TaskTable tasks={grouped[project]} showAssignee={false} />
                </div>
              </div>
            </div>

            {/* Subtle ID Stamp */}
            <div className="absolute bottom-2 right-4 opacity-[0.03] pointer-events-none select-none font-mono text-[8px] text-white">
              PRJ-TILE-{project.slice(0, 3).toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
