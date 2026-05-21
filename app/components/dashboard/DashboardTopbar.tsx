import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import type { IconType } from 'react-icons';
import Image from 'next/image';
import logo from "../../../public/hiresense-logo.png"


export default function DashboardTopbar() {
  return (
    <header className="flex min-h-16 flex-col gap-4 border-b border-slate-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between md:px-7">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-[#203f99] text-[#203f99]">
          <Image src={logo} alt="HireSense Logo" width={16} height={16} />  
        </span>
        <span className="text-xl font-bold text-[#061b55]">HireSense</span>
      </div>

      <div className="flex items-center gap-4">
        <label className="relative block w-full md:w-64">
          <HiOutlineSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="h-11 w-full rounded-lg border border-slate-300 bg-[#eef1f7] pl-11 pr-4 text-[12px] text-[#03173f] outline-none transition focus:border-[#203f99] focus:bg-white"
            placeholder="Search..."
            type="search"
          />
        </label>

      </div>
    </header>
  );
}
