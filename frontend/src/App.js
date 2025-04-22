import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Box } from '@mui/material';
import Navbar from './components/Common/Navbar';
import LoginPage from './components/Auth/LoginPage';
import PrivateRoute from './components/Common/PrivateRoute';
import CreateEvent from './components/Events/CreateEvent';
import EventDetails from './components/Events/EventDetails';
import EditEvent from './components/Events/EditEvent';
import EventApproval from './components/Admin/EventApproval';
import VolunteerApplication from './components/Volunteers/VolunteerApplication';
import CreateVolunteerRequest from './components/Volunteers/CreateVolunteerRequest';
import VolunteerOpportunities from './components/Volunteers/VolunteerOpportunities';
import AdminDashboard from './components/Admin/Dashboard';
import CreatePoll from './components/Polls/CreatePoll';
import PollList from './components/Polls/PollList';
import Poll from './components/Polls/Poll';
import VenueForm from './components/Admin/VenueForm';
import VenueBooking from './components/venue/VenueBooking';
import VenueApproval from './components/Admin/VenueApproval';
import EventList from './components/Events/EventList';
import UserDashboard from './components/Dashboard/UserDashboard';
import OrganiserDashboard from './components/Dashboard/organiserDashboard';
import MyEvents from './components/Events/MyEvents';
import AttendeesList from './components/Attendance/AttendeesList';
import './App.css';
import AccommodationApprovals from './components/Accommodation/AccommodationApprovals';
import AccommodationBooking from './components/Accommodation/AccommodationBooking';
import AccommodationManagement from './components/Accommodation/AccommodationManagement';
import AdminApprovals from './components/Admin/Approvals';
import UserPollResults from './components/Polls/PollResults';
import VolunteerApplicationsView from './components/Volunteers/ViewApplications';
import EventStatusUpdater from './components/utils/UpdateStatus';
import EventFeedbackDetails from './components/Feedback/ViewFeedback';
import QRScanner from './components/Attendance/QRScanner';
import ReportIssue from './components/Issues/ReportIssues';
import ViewIssues from './components/Issues/ViewIssues';
import IssuesList from './components/Issues/IssuesList';
import VolunteerApplicationsList from './components/Volunteers/VolunteerApplicationList';
import VolunteerOpportunitiesList from './components/Volunteers/VolunteeropportunitiesList';


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithRouter />
      </Router>
    </AuthProvider>
  );
}

function AppWithRouter() {
  const location = useLocation();
  const hideNavbarOnRoutes = ['/login'];
  const shouldHideNavbar = hideNavbarOnRoutes.includes(location.pathname);

  return (
    <>
      <EventStatusUpdater />
      <Box sx={{ display: 'flex' }}>
        {!shouldHideNavbar && <Navbar />}
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '20px' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/volunteer" element={<VolunteerOpportunities />} />
            <Route path="/polls" element={<PollList />} />
            <Route path="/polls/:pollId" element={<Poll />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/mark-attendance/:eventId" element={<AttendeesList />} />

            {/* Private Routes */}
            <Route path="/Dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/events/:eventId/report-issue" element={<ReportIssue />} />
            <Route path="/events/:eventId/issues" element={<PrivateRoute><IssuesList /></PrivateRoute>} />
            <Route path="/qr-scanner" element={<PrivateRoute><QRScanner /></PrivateRoute>} />
            <Route path="/organiser/Dashboard" element={<PrivateRoute organiserOnly><OrganiserDashboard /></PrivateRoute>} />
            <Route path="/organiser/myEvents" element={<PrivateRoute organiserOnly><MyEvents /></PrivateRoute>} />
            <Route path="/volunteer-requests/:requestId/applications" element={<VolunteerApplicationsList />} />


            <Route path="/events/:eventId/feedback" element={<PrivateRoute roles={['organiser', 'admin']}><EventFeedbackDetails /></PrivateRoute>} />

            {/* Organiser Only */}
            <Route path="/create-event" element={<PrivateRoute organiserOnly><CreateEvent /></PrivateRoute>} />
            <Route path="/events/:eventId/edit" element={<PrivateRoute organiserOnly><EditEvent /></PrivateRoute>} />

            {/* Event and Volunteer */}
            <Route path="/events/:eventId" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
            <Route path="/events/:eventId/volunteer" element={<PrivateRoute><VolunteerApplication /></PrivateRoute>} />
            <Route path="/volunteer/request" element={<PrivateRoute><CreateVolunteerRequest /></PrivateRoute>} />
            <Route path="/poll/results" element={<PrivateRoute><UserPollResults /></PrivateRoute>} />
            <Route path="/volunteer/apply/:requestId" element={<PrivateRoute><VolunteerApplication /></PrivateRoute>} />

            {/* Polls */}
            <Route path="/create-poll" element={<PrivateRoute organiserOnly><CreatePoll /></PrivateRoute>} />

            {/* Admin Only */}
            <Route path="/event/approvals" element={<PrivateRoute adminOnly><EventApproval /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
            <Route path="/venue/addvenue" element={<PrivateRoute adminOnly><VenueForm /></PrivateRoute>} />
            <Route path="/venue/approval" element={<PrivateRoute adminOnly><VenueApproval /></PrivateRoute>} />

            {/* General Authenticated Routes */}
            <Route path="/venue/venueBooking" element={<PrivateRoute organiserOnly><VenueBooking /></PrivateRoute>} />
            <Route path="/volunteer/applications" element={<PrivateRoute organiserOnly><VolunteerOpportunitiesList /></PrivateRoute>} />
            <Route path="/accommodation/booking" element={<PrivateRoute organiserOnly><AccommodationBooking /></PrivateRoute>} />
            <Route path="/accommodation/approvals" element={<PrivateRoute adminOnly><AccommodationApprovals /></PrivateRoute>} />
            <Route path="/accommodation/management" element={<PrivateRoute adminOnly><AccommodationManagement /></PrivateRoute>} />
            <Route path="/admin/approvals" element={<PrivateRoute adminOnly><AdminApprovals /></PrivateRoute>} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;
