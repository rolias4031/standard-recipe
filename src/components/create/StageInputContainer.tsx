import React, { ReactNode } from 'react'

function StageInputContainer({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-col space-y-3 border-y p-7'>
      {children}
    </div>
  )
}

export default StageInputContainer