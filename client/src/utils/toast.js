import toast from "react-hot-toast";

// Shared toast styling (previously duplicated inline across ~10 call sites).
const baseStyle = {
  border: "1px solid white",
  padding: "16px 30px",
  color: "white",
  backgroundColor: "rgb(29, 155, 240)",
};

const iconTheme = { primary: "white", secondary: "rgb(29, 155, 240)" };

export const notify = (message) => toast(message, { style: baseStyle });
export const notifySuccess = (message) => toast.success(message, { style: baseStyle, iconTheme });
