"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo2 from "../../../../public/global/logo2.png";
import { useRouter } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";
import { FaEdit } from "react-icons/fa";

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Prefilled user data ---
  const [profileData, setProfileData] = useState({
    image: "/global/no-picture.jpg",
    name: "Md Saidul Basar",
    email: "saidul@example.com",
    phone: "01700000000",
    level: "HSC",
    batch: "2023",
    board: "Dhaka",
    institution: "Govt. Titumir College",
    address: "Dhaka, Bangladesh",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Profile:", profileData);
    // TODO: Update API call for editing profile
    router.push("/dashboard");
  };

  return (
    <main>
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center gradient-text mb-6">
            Edit Your Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center justify-center my-10">
              <div className="relative">
                {profileData.image ? (
                  <Image
                    src={profileData.image}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="w-32 h-32 rounded-full object-cover border-2 border-[#f97a00]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-[#f97a00]">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-white text-[#f97a00] p-2 rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
                >
                  <FaEdit size={16} />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const imageUrl = URL.createObjectURL(file);
                      setProfileData({ ...profileData, image: imageUrl });
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* ---- Form Fields ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Enter your name*"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Enter your email*"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                required
              />

              <input
                type="phone"
                placeholder="Enter your phone*"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                required
              />

              <CustomSelect
                label="Select your level"
                options={[
                  "PSC",
                  "SSC",
                  "HSC",
                  "BCS",
                  "BS",
                  "BA",
                  "BBA",
                  "MA",
                  "PHD",
                ]}
                value={profileData.level}
                onChange={(val) =>
                  setProfileData({ ...profileData, level: val })
                }
              />

              <CustomSelect
                label="Select your batch"
                options={[
                  "2010",
                  "2011",
                  "2012",
                  "2013",
                  "2014",
                  "2015",
                  "2016",
                  "2017",
                  "2018",
                  "2019",
                  "2020",
                  "2021",
                  "2022",
                  "2023",
                  "2024",
                  "2025",
                  "2026",
                  "2027",
                  "2028",
                  "2029",
                  "2030",
                ]}
                value={profileData.batch}
                onChange={(val) =>
                  setProfileData({ ...profileData, batch: val })
                }
              />

              <CustomSelect
                label="Select your board"
                options={[
                  "Dhaka",
                  "Chattogram",
                  "Rajshahi",
                  "Khulna",
                  "Barishal",
                  "Rangpur",
                  "Mymensingh",
                  "Sylhet",
                  "Comilla",
                ]}
                value={profileData.board}
                onChange={(val) =>
                  setProfileData({ ...profileData, board: val })
                }
              />

              <input
                type="text"
                placeholder="Institute Name*"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={profileData.institution}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    institution: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Address*"
                className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="w-full max-w-full md:max-w-sm flex ml-auto justify-center bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-md md:text-lg px-4 md:px-6 py-3 md:py-3 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
