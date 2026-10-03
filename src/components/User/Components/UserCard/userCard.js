import * as React from 'react';
import './userCard.css';

export default function UserCard({ voter }) {
    return (
        <div>
            <div className="User-Card">

                <div className="userImage">
                    {voter?.image ? (
                        <img src={voter.image} alt="voter" />
                    ) : voter?.profileImage ? (
                        <img src={voter.profileImage} alt="voter" />
                    ) : (
                        <p>No image</p>
                    )}
                </div>

                <br />

                <div className="userDetails1">

                    <p>
                        <h6>
                            Name: &nbsp; {voter?.fullName || 'Not available'}
                        </h6>
                    </p>

                    <p>
                        <h6>
                            Age: &nbsp; {voter?.age || 'Not available'}
                        </h6>
                    </p>

                    <p>
                        <h6>
                            Phone: &nbsp; {voter?.phone || 'Not available'}
                        </h6>
                    </p>

                    <p>
                        <h6>
                            VoterID: &nbsp; {voter?.voterId || 'Not available'}
                        </h6>
                    </p>

                    <p>
                        <h6>
                            Voter Status: &nbsp;

                            {voter?.voteStatus ? (
                                <span className="Voted">
                                    Voted
                                </span>
                            ) : (
                                <span className="notVoted">
                                    Not Voted
                                </span>
                            )}
                        </h6>
                    </p>

                </div>
            </div>
        </div>
    );
}