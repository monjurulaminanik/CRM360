import { Routes, Route } from 'react-router-dom';
import PortfolioDashboard from './PortfolioDashboard';
import ProjectWorkspace from './ProjectWorkspace';

export default function ProjectsRouter() {
  return (
    <Routes>
      <Route index element={<PortfolioDashboard />} />
      <Route path=":id" element={<ProjectWorkspace />} />
    </Routes>
  );
}
