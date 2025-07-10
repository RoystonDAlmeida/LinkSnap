import ClicksChart from "./ClicksChart";
import UniqueUsersChart from "./UniqueUsersChart";
import DevicePieChart from "./DevicePieChart";
import OSPieChart from "./OSPieChart";

const chartData = [
  {
    label: "Daily Clicks",
    icon: "📈",
    color: "text-blue-700",
    description: "Track how many times your link was clicked each day.",
    component: ClicksChart,
    dataKey: "dailyClicks",
  },
  {
    label: "Unique Users",
    icon: "👤",
    color: "text-green-700",
    description: "See how many unique users accessed your link per day.",
    component: UniqueUsersChart,
    dataKey: "uniqueUsers",
  },
  {
    label: "Device Breakdown",
    icon: "💻",
    color: "text-purple-700",
    description: "Understand which device types (desktop, mobile, tablet) your audience uses.",
    component: DevicePieChart,
    dataKey: "deviceStats",
  },
  {
    label: "OS Breakdown",
    icon: "🖥️",
    color: "text-orange-700",
    description: "See the operating systems your visitors are using.",
    component: OSPieChart,
    dataKey: "osStats",
  },
];

export default chartData; 