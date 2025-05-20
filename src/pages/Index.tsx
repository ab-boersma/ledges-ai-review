
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index: React.FC = () => {
  // Redirect to dashboard as the main page
  return <Navigate to="/dashboard" replace />;
};

export default Index;
