import Image from "next/image";
// import user from "../../../public/user/md-saidul.jpeg";

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
    <div className="flex items-center gap-4">
      <div className="border-2 border-[#dd6b01] rounded-lg">
        <Image
          src={image}
          alt={name}
          width={120}
          height={120}
          className="rounded-lg object-cover"
        />
      </div>
      <div>
        <p className="text-sm text-gray-500">{board + " | " + level + " " + batch}</p>
        <h2 className="text-xl md:text-2xl font-bold text-[#dd6b01]">{name}</h2>
        <p className="text-gray-600">{institution}</p>
      </div>
    </div>
  );
}
