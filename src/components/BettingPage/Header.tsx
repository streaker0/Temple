import React from 'react';
import { MIN_BET, MAX_BET } from '../../constants/game.constants';

export const Header: React.FC = () => {
    return (
        <div className="top-section">
            <button className="rules-button">RULES</button>
            <div className="header">TEMPLE</div>
            <div className="bet-limits">
                <p>Bet limit:</p>
                <p>Min: ${MIN_BET}</p>
                <p>Max: ${MAX_BET}</p>
            </div>
        </div>
    );
};