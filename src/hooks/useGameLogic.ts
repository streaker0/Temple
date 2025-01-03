import { useState } from 'react';
import { GameState, PlayerAction, SpotCard, SpotBet } from '../types/game.types';
import { dealRandomCard, getCardValue } from '../utils/cardUtils';
import { INITIAL_BALANCE, MAX_BET, MIN_BET, DEALER_MIN_TOTAL, MAX_CARDS, NUM_SPOTS } from '../constants/game.constants';

export const useGameLogic = () => {
    const [balance, setBalance] = useState(INITIAL_BALANCE);
    const [bet, setBet] = useState(0);
    const [anteBet, setAnteBet] = useState(0);
    const [selectedDenomination, setSelectedDenomination] = useState(10);
    const [showChipButtons, setShowChipButtons] = useState(false);
    const [gameState, setGameState] = useState<GameState>('betting');
    const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
    const [anteCard, setAnteCard] = useState<SpotCard>(null);
    const [dealerCard, setDealerCard] = useState<SpotCard>(null);
    const [spotCards, setSpotCards] = useState<SpotCard[]>(Array(NUM_SPOTS).fill(null));
    const [spotBets, setSpotBets] = useState<SpotBet[]>(
        Array(4).fill({ faceUp: 0, faceDown: 0 })
    );
    const [dealerCards, setDealerCards] = useState<SpotCard[]>([]);

    const handleGameOver = () => {
        setGameState('gameOver');
        let currentDealerCards: SpotCard[] = [];
        
        if (dealerCard) {
            currentDealerCards = [{ ...dealerCard, isFaceUp: true }];
        }

        let dealerTotal = currentDealerCards.reduce((total, card) => 
            card ? total + getCardValue(card.rank) : total, 0);

        while (dealerTotal < DEALER_MIN_TOTAL && currentDealerCards.length < MAX_CARDS) {
            const newCard = dealRandomCard();
            newCard.isFaceUp = true;
            currentDealerCards.push(newCard);
            dealerTotal += getCardValue(newCard.rank);
        }
        
        setDealerCards(currentDealerCards);
        setAnteCard(prev => prev ? { ...prev, isFaceUp: true } : null);
        setSpotCards(prev => prev.map(card => card ? { ...card, isFaceUp: true } : null));
    };

    const calculateHandTotal = () => {
        const spotTotal = spotCards.reduce((total, card) => {
            if (!card || !card.isFaceUp) return total;
            return total + getCardValue(card.rank);
        }, 0);
        
        const anteValue = anteCard && anteCard.isFaceUp ? getCardValue(anteCard.rank) : 0;
        return spotTotal + anteValue;
    };

    const placeBet = (amount: number) => {
        if (gameState !== 'betting') return;

        const newBet = bet + amount;
        const newBalance = balance - amount;
        
        if (newBet <= balance && newBet <= MAX_BET && newBalance >= 0 && newBet >= MIN_BET) {
            setAnteBet(newBet);
            setBet(newBet);
            setBalance(newBalance);
        }
    };

    const clearBet = () => {
        if (gameState !== 'betting') return;
        setBalance(prev => prev + bet);
        setBet(0);
        setAnteBet(0);
    };

    const startGame = () => {
        if (bet <= 0) return false;
        
        setAnteCard(dealRandomCard());
        setDealerCard(dealRandomCard());
        setGameState('playing');
        setCurrentSpotIndex(0);
        return true;
    };

    const handlePlayerAction = (action: PlayerAction) => {
        if (currentSpotIndex >= 4) {
            handleGameOver();
            return;
        }

        switch (action) {
            case 'stand':
                handleGameOver();
                break;
            case 'faceUp':
            case 'faceDown':
                if (balance >= anteBet) {
                    const newCard = dealRandomCard();
                    if (action === 'faceUp') {
                        newCard.isFaceUp = true;
                    }

                    setSpotCards(prev => {
                        const newCards = [...prev];
                        newCards[currentSpotIndex] = newCard;
                        return newCards;
                    });

                    setSpotBets(prev => {
                        const newBets = [...prev];
                        newBets[currentSpotIndex] = {
                            ...newBets[currentSpotIndex],
                            [action === 'faceUp' ? 'faceUp' : 'faceDown']: anteBet
                        };
                        return newBets;
                    });

                    setBalance(prev => prev - anteBet);
                    setBet(prev => prev + anteBet);
                    setCurrentSpotIndex(prev => prev + 1);

                    if (currentSpotIndex === 3) {
                        handleGameOver();
                    }
                }
                break;
        }
    };

    return {
        balance,
        bet,
        anteBet,
        selectedDenomination,
        showChipButtons,
        setShowChipButtons,
        gameState,
        currentSpotIndex,
        anteCard,
        dealerCard,
        spotCards,
        spotBets,
        dealerCards,
        setSelectedDenomination,
        calculateHandTotal,
        placeBet,
        clearBet,
        startGame,
        handlePlayerAction
    };
};