import { IoCloudUploadOutline } from "react-icons/io5";

export default function uploadPanel (){
  return (
     <div className="w-full md:w-1/2 h-full border border-white/20 rounded-2xl backdrop-blur-md bg-white/5 z-10 p-4 text-white flex items-center justify-center">
          <label htmlFor="pdf-upload"
            className="group w-full h-full flex flex-col items-center justify-center border border-dashed border-white/40 rounded-2xl cursor-pointer hover:bg-[#6893e31a] transition duration-200">
            <IoCloudUploadOutline size={100} className="text-white" />
            <p className="mt-4 text-lg group-hover:text-blue-400 transition-colors duration-200">Click to upload PDF</p>

            <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => {
              if(e.target.files.length>0){
                const file = e.target?.files?.[0];
                if (file) {
                  console.log("Selected file:", file.name);
                } else {
                  console.log("No file selected.");
                }
              }
              }}/>
          </label>
        </div>

  )
}
