import "./style.css";

import { createRoot } from "react-dom/client";
import SplitScreenApp from "./SplitScreenApp";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<SplitScreenApp />);
