import FacHeader from '@/components/Faculty/FacHeader'
import FacNavbar from '@/components/Faculty/FacNavbar'
import React from 'react'

const page = () => {
  return (
    <div className='h-screen w-full overflow-hidden bg-gray-200 flex'>
        <FacNavbar />
        <div className="flex flex-col w-[85vw]">
            <FacHeader title={"Report"} user={`Navneet`} />
        </div>
    </div>
  )
}

export default page