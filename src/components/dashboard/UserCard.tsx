import Image from "next/image";

interface UserCardProps {
  name: string;
  board: string;
  level: string;
  batch: string;
  institution: string;
  image: string;
}

export default function UserCard({
  name,
  board,
  level,
  batch,
  institution,
  image,
}: UserCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white border border-gray-100/80 rounded-3xl shadow-md shadow-gray-100/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 relative overflow-hidden group h-full">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>
      
      <div className="relative group shrink-0">
        {/* Animated avatar border gradient */}
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-45 transition duration-500"></div>
        <div className="relative border-4 border-white rounded-3xl overflow-hidden shadow-md w-28 h-28 sm:w-32 sm:h-32 bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-[#dd6b01] text-4xl font-black">
              {name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className="text-center sm:text-left flex-1 relative z-10 flex flex-col justify-center h-full sm:pt-2">
        <div className="inline-flex items-center mx-auto sm:mx-0 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-3.5 uppercase tracking-widest border border-primary/20">
          {board} • {level} • {batch}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
          {name}
        </h2>
        <p className="text-gray-500 font-semibold text-xs flex items-center justify-center sm:justify-start gap-2">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
          {institution}
        </p>
      </div>
    </div>
  );
}
