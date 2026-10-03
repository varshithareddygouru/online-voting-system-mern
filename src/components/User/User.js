import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../Navbar/UserNavbar";
import './CSS/user.css';
import UserCard from './Components/UserCard/userCard';
import UpcomingElections from './Components/UpcomingElections';
import ScrollReveal from "scrollreveal";
import { BASE_URL } from '../../helper';
import Cookies from 'js-cookie';

const User = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // Get voter information passed from Login page
  const { voterst } = location.state || {};

  // --------------------------------------------------
  // LOGIN CHECK
  // --------------------------------------------------
  useEffect(() => {
    if (!voterst && !Cookies.get('myCookie')) {
      navigate('/Login');
    }
  }, [voterst, navigate]);

  // --------------------------------------------------
  // SAVE CURRENT VOTER ID IN COOKIE
  // --------------------------------------------------
  useEffect(() => {
  if (voterst?.id) {
    console.log("Saving voter ID in cookie:", voterst.id);

    Cookies.set('myCookie', voterst.id, {
      expires: 7
    });
  }
}, [voterst]);

const voterid = voterst?.id || Cookies.get('myCookie');

  console.log("Voter object from login:", voterst);
  console.log("Voter ID being used:", voterid);

  // --------------------------------------------------
  // REFS FOR SCROLL REVEAL
  // --------------------------------------------------
  const revealRefBottom = useRef(null);
  const revealRefLeft = useRef(null);
  const revealRefTop = useRef(null);
  const revealRefRight = useRef(null);

  // --------------------------------------------------
  // VOTER STATE
  // --------------------------------------------------
  const [singleVoter, setVoter] = useState({});

  // --------------------------------------------------
  // GET VOTER DETAILS
  // --------------------------------------------------
  useEffect(() => {

    console.log("=================================");
    console.log("Fetching voter information...");
    console.log("Voter ID:", voterid);
    console.log("=================================");

    if (!voterid) {
      console.log("❌ No voter ID found");
      return;
    }

    console.log("✅ Fetching voter with ID:", voterid);

    axios
      .get(`${BASE_URL}/getVoterbyID/${voterid}`)
      .then((response) => {

        console.log("✅ Voter response received:");
        console.log(response.data);

        if (response.data.success) {
          setVoter(response.data.voter || {});
        } else {
          console.log("❌ Backend returned unsuccessful response");
          setVoter({});
        }

      })
      .catch((error) => {

        console.error("❌ Error fetching voter data:");

        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Response:", error.response.data);
        } else {
          console.error(error.message);
        }

      });

  }, [voterid]);

  // --------------------------------------------------
  // SCROLL REVEAL - TOP
  // --------------------------------------------------
  useEffect(() => {

    if (revealRefTop.current) {
      ScrollReveal().reveal(revealRefTop.current, {
        origin: 'top',
        distance: '50px',
        duration: 1000,
        delay: 200,
        reset: false
      });
    }

  }, []);

  // --------------------------------------------------
  // SCROLL REVEAL - LEFT
  // --------------------------------------------------
  useEffect(() => {

    if (revealRefLeft.current) {
      ScrollReveal().reveal(revealRefLeft.current, {
        origin: 'left',
        distance: '50px',
        duration: 1000,
        delay: 200,
        reset: false
      });
    }

  }, []);

  // --------------------------------------------------
  // SCROLL REVEAL - RIGHT
  // --------------------------------------------------
  useEffect(() => {

    if (revealRefRight.current) {
      ScrollReveal().reveal(revealRefRight.current, {
        origin: 'right',
        distance: '50px',
        duration: 1000,
        delay: 200,
        reset: false
      });
    }

  }, []);

  // --------------------------------------------------
  // SCROLL REVEAL - BOTTOM
  // --------------------------------------------------
  useEffect(() => {

    if (revealRefBottom.current) {
      ScrollReveal().reveal(revealRefBottom.current, {
        origin: 'bottom',
        distance: '50px',
        duration: 1000,
        delay: 200,
        reset: false
      });
    }

  }, []);

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------
  return (

    <div className="User">

      <UserNavbar />

      {/* --------------------------------------------- */}
      {/* WELCOME HEADING */}
      {/* --------------------------------------------- */}

      <div
        className="Heading2"
        ref={revealRefTop}
      >

        <h3>
          Welcome{" "}
          <span>
            {singleVoter.fullName || "User"}
          </span>
        </h3>

      </div>


      {/* --------------------------------------------- */}
      {/* USER DETAILS + OTHER CONTENT */}
      {/* --------------------------------------------- */}

      <div className="userPage">

        {/* USER CARD */}
        <div
          className="userDetails"
          ref={revealRefLeft}
        >

          <UserCard voter={singleVoter} />

        </div>


        {/* RIGHT SIDE CONTENT */}
        <div
          className="details"
          ref={revealRefRight}
        >

          {/* Keep your existing content here */}

        </div>

      </div>


      {/* --------------------------------------------- */}
      {/* UPCOMING ELECTIONS */}
      {/* --------------------------------------------- */}

      <div ref={revealRefBottom}>

        <UpcomingElections
          voteStatus={singleVoter.voteStatus}
        />

      </div>

    </div>
  );
};

export default User;