import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Home from './pages/Home';
import Workouts from './Workouts';
import WorkoutSession from './WorkoutSession';
import Profile from './Profile';
import MyRoutine from './MyRoutine';
import Calendar from './Calendar';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/mocked/Home" replace />} />
            <Route path="/mocked/Home" element={<Home />} />
            <Route path="/mocked/Workouts" element={<Workouts />} />
            <Route path="/mocked/WorkoutSession" element={<WorkoutSession />} />
            <Route path="/mocked/Profile" element={<Profile />} />
            <Route path="/mocked/MyRoutines" element={<MyRoutine />} />
            <Route path="/mocked/Calendar" element={<Calendar />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;