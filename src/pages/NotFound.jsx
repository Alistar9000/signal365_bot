import { XCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="w-full h-full items-center flex justify-center">
      <div className="text-neutral-400 flex items-center gap-4 text-lg">
        <XCircle size={25} />
        <p>صفحه مورد نظر یافت نشد</p>
      </div>
    </div>
  );
};

export default NotFound;
