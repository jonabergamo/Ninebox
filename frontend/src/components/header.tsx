import React from 'react'
import UserInfo from './userInfo'
import ClassSwitch from './classSwitch'

export default function Header() {
  return (
      <header className='flex justify-between py-5'>
          <ClassSwitch />
          <UserInfo />
      </header>
  )
}
