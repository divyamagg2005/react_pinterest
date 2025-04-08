import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Reset search input
        setSearchQuery('');
        // Navigate to home with search query
        navigate('/', { state: { searchQuery: searchQuery.trim() } });
      }
    }
  };

  return (
    <nav className="navbar">
      <img src="/assests/mdi_pinterest.svg" alt="logo" />
      <Link to="/">Home</Link>
      <Link to="/today">Today</Link>
      <Link to="/create">Create</Link>
      <input 
        type="search" 
        placeholder="Search" 
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleSearch}
      />
      <img className="icons" src="/assests/notification.svg" alt="notification" />
      <img className="icons" src="/assests/message.svg" alt="message" />
      <img className="icons" src="/assests/account.svg" alt="user" />
    </nav>
  );
};

export default Navbar; 