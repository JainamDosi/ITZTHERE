import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { FiUploadCloud, FiShield, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { MdOutlineStorage } from 'react-icons/md';

const features = [
  {
    title: 'Secure File Upload',
    description: 'Upload and store documents with end-to-end encryption.',
    icon: <FiUploadCloud className="text-4xl text-indigo-500" />
  },
  {
    title: 'Admin Approval Workflow',
    description: 'Admins can review and approve uploaded files.',
    icon: <FiCheckCircle className="text-4xl text-green-500" />
  },
  {
    title: '2FA Authentication',
    description: 'Protect accounts with email and phone OTP-based 2FA.',
    icon: <FiShield className="text-4xl text-red-500" />
  },
  {
    title: 'Role-Based Access',
    description: 'Clients and employees see only what they are allowed.',
    icon: <FiUsers className="text-4xl text-yellow-500" />
  },
  {
    title: 'Cloud Storage with Metadata',
    description: 'Store files on Cloudinary/Storj and manage with MongoDB.',
    icon: <MdOutlineStorage className="text-4xl text-blue-500" />
  }
];

export default function FeatureCarousel() {
  return (
    <div className="w-full bg-gray-100 rounded-xl p-6">
      <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">Product Features</h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
       
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index} className="h-full">
            <div className="bg-white h-[160px] p-6 rounded-lg shadow-md hover:shadow-xl mb-2 transition-all flex flex-col justify-between">
              <div>{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
