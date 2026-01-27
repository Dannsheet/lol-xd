import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar/BottomTabBar';
import AnnouncementsModal from '../components/Announcements/AnnouncementsModal';

const ProtectedLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <AnnouncementsModal />
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
};

export default ProtectedLayout;
