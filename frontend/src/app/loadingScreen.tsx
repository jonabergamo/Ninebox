import Logo27Box from '@/assets/27box_logo.svg'
import Image from "next/image";


export default function LoadingScreen() {
  // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className='fixed inset-0 bg-white-500 z-[10000] flex flex-1 items-center justify-center'>
            <Image
              src={Logo27Box}
              alt="Sample image"
            />
        </div>
    )
}