
import React, { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import "../CSS/upcomingElections.css";
import { BASE_URL } from '../../../helper';

const UpcomingElections = ({ voteStatus }) => {
    const navigate = useNavigate();

    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const revealRefBottom = useRef(null);
    const revealRefLeft = useRef(null);
    const revealRefTop = useRef(null);
    const revealRefRight = useRef(null);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/elections`
                );

                console.log("Elections response:", response.data);

                if (response.data.success) {
                    setElections(
                        response.data.data ||
                        response.data.elections ||
                        []
                    );
                } else {
                    setError(
                        response.data.message ||
                        'Unable to load elections'
                    );
                }
            } catch (err) {
                console.error(
                    "Error fetching elections:",
                    err
                );

                setError(
                    "Unable to load elections. Please make sure the server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchElections();
    }, []);

    useEffect(() => {
        if (revealRefBottom.current) {
            ScrollReveal().reveal(
                revealRefBottom.current,
                {
                    duration: 1000,
                    delay: 200,
                    distance: '50px',
                    origin: 'bottom',
                    easing: 'ease',
                    reset: true,
                }
            );
        }

        if (revealRefRight.current) {
            ScrollReveal().reveal(
                revealRefRight.current,
                {
                    duration: 1000,
                    delay: 200,
                    distance: '50px',
                    origin: 'right',
                    easing: 'ease',
                    reset: true,
                }
            );
        }

        if (revealRefLeft.current) {
            ScrollReveal().reveal(
                revealRefLeft.current,
                {
                    duration: 1000,
                    delay: 200,
                    distance: '50px',
                    origin: 'left',
                    easing: 'ease',
                    reset: true,
                }
            );
        }

        if (revealRefTop.current) {
            ScrollReveal().reveal(
                revealRefTop.current,
                {
                    duration: 1000,
                    delay: 200,
                    distance: '50px',
                    origin: 'top',
                    easing: 'ease',
                    reset: true,
                }
            );
        }
    }, [elections]);

    const handleVote = (election) => {
        if (voteStatus) {
            alert("You Have Already Voted");
            return;
        }

        navigate('/Vote', {
            state: {
                electionId: election._id,
                electionTitle: election.title
            }
        });
    };

    return (
        <div className="upcomingElections">

            <h2 ref={revealRefTop}>
                Upcoming Elections
            </h2>

            {loading && (
                <p>Loading elections...</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {!loading &&
                !error &&
                elections.length === 0 && (
                    <p>No elections available.</p>
                )}

            <div className="upcomingElectionsCardContainer">

                {elections.map((election, index) => {

                    const refs = [
                        revealRefLeft,
                        revealRefBottom,
                        revealRefRight
                    ];

                    const currentRef =
                        refs[index % refs.length];

                    return (
                        <div
                            className="upcomingElectionCard"
                            ref={currentRef}
                            key={election._id}
                        >

                            <h3>
                                {election.title}
                            </h3>

                            <br />

                            <p>
                                {election.description}
                            </p>

                            <br />

                            <button
                                onClick={() =>
                                    handleVote(election)
                                }
                            >
                                Participate/Vote
                            </button>

                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default UpcomingElections;
