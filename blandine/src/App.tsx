import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Map from './pages/Map';
import List from './pages/List';
import Details from './pages/Details';
import OnDuty from './pages/OnDuty';
import Account from './pages/Account';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/list" element={<List />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/on-duty" element={<OnDuty />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
