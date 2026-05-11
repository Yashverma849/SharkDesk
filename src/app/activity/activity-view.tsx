"use client";

import { useMemo } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
// } from "recharts";
import {
  type ActivityFeedItem,
  classifyActivity,
  kindLabel,
  // buildPieByProject,
} from "@/lib/activity-display";
import { formatActivityWhen } from "@/lib/db/mappers";

// const PIE_COLORS = [
//   "#14B8A6",
//   "#3b82f6",
//   "#a855f7",
//   "#f59e0b",
//   "#ec4899",
//   "#22d3ee",
//   "#94a3b8",
// ];

type Props = {
  items: ActivityFeedItem[];
  projectNames: Record<string, string>;
};

// function ActivityPieCard({
//   title,
//   data,
//   subtitle,
// }: {
//   title: string;
//   data: { name: string; value: number }[];
//   subtitle?: string;
// }) {
//   const total = data.reduce((s, d) => s + d.value, 0);
//   const empty = total === 0;
//
//   return (
//     <div className="flex flex-col rounded-xl border border-[#1F2937] bg-[#121826] p-4 shadow-sm">
//       <h2 className="text-sm font-semibold text-[#E5E7EB]">{title}</h2>
//       {subtitle ? (
//         <p className="mt-0.5 text-xs text-[#9CA3AF]">{subtitle}</p>
//       ) : null}
//       <div className="mt-2 h-[220px] w-full min-h-[220px]">
//         {empty ? (
//           <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-[#2d3548] bg-[#0B0F1A]/50 text-center text-xs text-[#9CA3AF]">
//             No events in this category yet
//           </div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={data}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={48}
//                 outerRadius={72}
//                 paddingAngle={2}
//               >
//                 {data.map((entry, i) => (
//                   <Cell
//                     key={entry.name}
//                     fill={PIE_COLORS[i % PIE_COLORS.length]}
//                     stroke="#0f172a"
//                     strokeWidth={1}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "#1a2234",
//                   border: "1px solid #2d3548",
//                   borderRadius: "8px",
//                   fontSize: "12px",
//                   color: "#E5E7EB",
//                 }}
//               />
//               <Legend
//                 wrapperStyle={{ fontSize: "11px", color: "#9CA3AF" }}
//                 formatter={(value) => (
//                   <span className="text-[#cbd5e1]">{value}</span>
//                 )}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//       {!empty ? (
//         <p className="mt-1 text-center text-xs text-[#9CA3AF]">
//           {total} event{total === 1 ? "" : "s"} · by project
//         </p>
//       ) : null}
//     </div>
//   );
// }

export function ActivityView({ items, projectNames }: Props) {
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  // const newTasksPie = useMemo(
  //   () => buildPieByProject(items, "new_task", projectNames),
  //   [items, projectNames],
  // );
  // const assignedPie = useMemo(
  //   () => buildPieByProject(items, "task_assigned", projectNames),
  //   [items, projectNames],
  // );
  // const statusPie = useMemo(
  //   () => buildPieByProject(items, "status_changed", projectNames),
  //   [items, projectNames],
  // );

  const tableRows = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((row) => {
        const kind = classifyActivity(row);
        return {
          ...row,
          kind,
          typeLabel: kindLabel(kind),
          projectLabel: row.project_id
            ? projectNames[row.project_id] ?? "Unknown project"
            : "—",
          whenLabel: formatActivityWhen(row.created_at),
        };
      });
  }, [items, projectNames]);

  return (
    <div className="flex flex-col">
      {/* Activity pie chart cards (disabled — uncomment block below to restore)
      {mounted ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActivityPieCard
            title="New task added"
            data={newTasksPie}
            subtitle="Share by project"
          />
          <ActivityPieCard
            title="Task assigned"
            data={assignedPie}
            subtitle="Assignee & teammate updates by project"
          />
          <ActivityPieCard
            title="Status changed"
            data={statusPie}
            subtitle="Task status updates by project"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[280px] animate-pulse rounded-xl border border-[#1F2937] bg-[#121826]"
            />
          ))}
        </div>
      )}
      */}

      <div className="flex flex-col">
        <h2 className="mb-3 shrink-0 text-lg font-semibold text-[#E5E7EB]">
          Activity log
        </h2>
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#1F2937] bg-[#121826]">
          {items.length === 0 ? (
            <div className="flex min-h-[12rem] items-center justify-center p-12 text-center text-sm text-[#9CA3AF]">
              No activity yet. Creating projects and tasks will show up here.
            </div>
          ) : (
            <div className="max-h-[calc(100dvh-14rem)] overflow-x-auto overflow-y-auto overscroll-y-contain">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#1F2937] bg-[#0B0F1A]">
                  <tr>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">
                    Type
                  </th>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">
                    Update
                  </th>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">
                    Project
                  </th>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">
                    When
                  </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#1F2937]/60 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            row.kind === "other"
                              ? "text-[#9CA3AF]"
                              : "font-medium text-[#14B8A6]"
                          }
                        >
                          {row.typeLabel}
                        </span>
                      </td>
                      <td className="max-w-md px-4 py-3 text-[#E5E7EB]">
                        {row.summary}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#9CA3AF]">
                        {row.projectLabel}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#9CA3AF]">
                        {row.whenLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
