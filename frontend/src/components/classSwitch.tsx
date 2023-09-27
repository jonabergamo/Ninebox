'use client'
import React from 'react'
import { useUser } from "@/context/UserContext";
import { useEffect } from 'react';
import axios from 'axios';


export default function ClassSwitch() {
    const { user } = useUser();


  return (
    <div className="absolute left-14 h-16 flex items-center justify-end px-5 space-x-5 ">
      
          <select id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        {/* {user?.map((class, index) => (
          <option value="US">United States</option>
        ))} */}
  
  <option value="CA">Canada</option>
  <option value="FR">France</option>
  <option value="DE">Germany</option>
</select>
          <div
            className="flex text-2xl w-8 h-8 aspect-square cursor-pointer bg-blue-500  p-2 rounded-full transition-all hover:scale-105 items-center text-white"
            >+</div>
    </div>
  )
}
