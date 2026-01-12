import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar/BottomTabBar';

const ProtectedLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
};

export default ProtectedLayout;
