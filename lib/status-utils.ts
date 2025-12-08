export const getStatusColor = (status: string | null | undefined) => {
  switch (status) {
    case "not_started":
      return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
    case "in_progress":
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
    case "on_hold":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
  }
};

export const getStatusLabel = (status: string | null | undefined) => {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "on_hold":
      return "On Hold";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Not Started";
  }
};

export const getStatusDescription = (status: string | null | undefined) => {
  switch (status) {
    case "not_started":
      return "Project has not started yet";
    case "in_progress":
      return "Project is currently active";
    case "on_hold":
      return "Project is temporarily paused";
    case "completed":
      return "Project has been completed";
    case "cancelled":
      return "Project has been cancelled";
    default:
      return "Project has not started yet";
  }
};