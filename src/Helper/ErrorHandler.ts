import "react-toastify/dist/ReactToastify.css";
import { Bounce, toast, ToastContentProps } from "react-toastify";


export const showErrorToast = (error: any ) => {
   if (error instanceof Error) {
   
    toast.error(error.message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Bounce,
  });
  } else {
    toast.error("An unexpected error occurred", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Bounce,
    });
  }
  
  
};


export const showSuccessToast = (message: string) => {
    toast.success(message);
};