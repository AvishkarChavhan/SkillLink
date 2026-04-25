import NavBarComponent from '@/components/navbar';
import React from 'react';
function UserLayout({children}) {
    return (<>
     <NavBarComponent/>
    {children}
  
    </>  );
}

export default UserLayout;