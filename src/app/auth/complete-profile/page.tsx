"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import logo2 from "../../../../public/global/logo2.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";
import { FaEdit } from "react-icons/fa";

export default function Verify() {
  const [profileData, setProfileData] = useState({
    image: "",
    name: "",
    email: "",
    phone: "",
    level: "",
    batch: "",
    board: "",
    institution: "",
    address: "",
  });

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile Data:", profileData);
    // TODO: Handle API call for login
    router.push("/auth/complete-profile");
  };

  return (
    <main className="">
      <section className="flex items-center justify-between mx-auto max-w-7xl w-full px-4 md:px-10 py-10">
        <div>
          <Link href="/">
            <Image src={logo2} alt="logo" className="w-40 md:w-60" />
          </Link>
        </div>
        <div className="">
          <Link href="/" className="text-sm md:text-lg font-semibold underline">
            Back to Home
          </Link>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center gradient-text mb-6">
            Complete Your Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile picture */}
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
                    {profileData.name
                      ? profileData.name.charAt(0).toUpperCase()
                      : "?"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter your name*"
                  className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Enter your email*"
                  className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              <div>
                <input
                  type="phone"
                  placeholder="Enter your phone*"
                  className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="numeric"
                />
              </div>

              <div className="">
                <CustomSelect
                  label="Enter your level*"
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
              </div>

              <div>
                <CustomSelect
                  label="Enter your batch*"
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
              </div>

              <div className="">
                <CustomSelect
                  label="Enter your board*"
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
              </div>

              <div>
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
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Address*"
                  className="w-full px-3 py-4 text-lg outline-none border border-solid border-[#f97a00] rounded-lg"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full max-w-full md:max-w-sm flex ml-auto justify-center bg-gradient-to-r from-[#dd6b01] to-[#f0b176] text-white font-semibold text-md md:text-lg px-4 md:px-6 py-3 md:py-3 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              Register Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
